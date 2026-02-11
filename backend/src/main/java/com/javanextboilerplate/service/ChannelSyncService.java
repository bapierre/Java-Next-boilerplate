package com.javanextboilerplate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.ChannelStats;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.ChannelStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelSyncService {

    private final ChannelRepository channelRepository;
    private final ChannelStatsRepository channelStatsRepository;
    private final ObjectMapper objectMapper;

    @Value("${TWITTER_CLIENT_ID:}")
    private String twitterClientId;
    @Value("${TWITTER_CLIENT_SECRET:}")
    private String twitterClientSecret;
    @Value("${YOUTUBE_CLIENT_ID:}")
    private String youtubeClientId;
    @Value("${YOUTUBE_CLIENT_SECRET:}")
    private String youtubeClientSecret;
    @Value("${TIKTOK_CLIENT_ID:}")
    private String tiktokClientId;
    @Value("${TIKTOK_CLIENT_SECRET:}")
    private String tiktokClientSecret;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Scheduled(cron = "0 0 7 * * *")
    public void syncAllChannels() {
        log.info("Starting daily channel follower sync");
        List<Channel> channels = channelRepository.findByIsActiveTrue();
        log.info("Found {} active channels to sync", channels.size());

        int success = 0;
        int failed = 0;

        for (Channel channel : channels) {
            try {
                syncChannel(channel);
                success++;
            } catch (Exception e) {
                failed++;
                log.warn("Failed to sync channel {} ({}): {}",
                        channel.getId(), channel.getPlatform().getValue(), e.getMessage());
            }
        }

        log.info("Daily sync complete: {} succeeded, {} failed out of {} total",
                success, failed, channels.size());
    }

    @Transactional
    public void syncChannel(Channel channel) {
        // Refresh token if expired
        if (channel.isTokenExpired()) {
            boolean refreshed = refreshToken(channel);
            if (!refreshed) {
                log.warn("Token refresh failed for channel {} ({}), marking inactive",
                        channel.getId(), channel.getPlatform().getValue());
                channel.setIsActive(false);
                channelRepository.save(channel);
                return;
            }
        }

        // Fetch current follower count
        Long followers = fetchFollowerCount(channel);
        if (followers == null) {
            log.warn("Could not fetch followers for channel {} ({})",
                    channel.getId(), channel.getPlatform().getValue());
            return;
        }

        // Save snapshot
        ChannelStats stats = ChannelStats.builder()
                .channel(channel)
                .recordedAt(LocalDateTime.now())
                .followersCount(followers)
                .build();
        channelStatsRepository.save(stats);

        // Update channel
        channel.setFollowerCount(followers);
        channel.setLastSyncedAt(LocalDateTime.now());
        channelRepository.save(channel);

        log.debug("Synced channel {} ({}): {} followers",
                channel.getId(), channel.getPlatform().getValue(), followers);
    }

    // ─── Follower Count Fetching ───

    private Long fetchFollowerCount(Channel channel) {
        try {
            return switch (channel.getPlatform()) {
                case TWITTER -> fetchTwitterFollowers(channel.getAccessToken());
                case YOUTUBE -> fetchYouTubeSubscribers(channel.getAccessToken());
                case TIKTOK -> fetchTikTokFollowers(channel.getAccessToken());
                case INSTAGRAM -> fetchInstagramFollowers(channel.getAccessToken());
                case FACEBOOK -> fetchFacebookFanCount(channel.getAccessToken());
            };
        } catch (Exception e) {
            log.warn("API call failed for {} channel {}: {}",
                    channel.getPlatform().getValue(), channel.getId(), e.getMessage());
            return null;
        }
    }

    private Long fetchTwitterFollowers(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twitter.com/2/users/me?user.fields=public_metrics"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        return json.path("data").path("public_metrics").path("followers_count").asLong(0);
    }

    private Long fetchYouTubeSubscribers(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode items = json.path("items");
        if (items.isArray() && !items.isEmpty()) {
            return items.get(0).path("statistics").path("subscriberCount").asLong(0);
        }
        return null;
    }

    private Long fetchTikTokFollowers(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/user/info/?fields=follower_count"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        return json.path("data").path("user").path("follower_count").asLong(0);
    }

    private Long fetchInstagramFollowers(String accessToken) throws Exception {
        String url = "https://graph.instagram.com/me?fields=followers_count&access_token="
                + encode(accessToken);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        return json.path("followers_count").asLong(0);
    }

    private Long fetchFacebookFanCount(String accessToken) throws Exception {
        String url = "https://graph.facebook.com/v21.0/me/accounts?fields=fan_count&access_token="
                + encode(accessToken);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode data = json.path("data");
        if (data.isArray() && !data.isEmpty()) {
            return data.get(0).path("fan_count").asLong(0);
        }
        return null;
    }

    // ─── Token Refresh ───

    private boolean refreshToken(Channel channel) {
        try {
            return switch (channel.getPlatform()) {
                case TWITTER -> refreshTwitterToken(channel);
                case YOUTUBE -> refreshYouTubeToken(channel);
                case TIKTOK -> refreshTikTokToken(channel);
                case INSTAGRAM, FACEBOOK -> false; // No refresh token — mark inactive when expired
            };
        } catch (Exception e) {
            log.warn("Token refresh failed for {} channel {}: {}",
                    channel.getPlatform().getValue(), channel.getId(), e.getMessage());
            return false;
        }
    }

    private boolean refreshTwitterToken(Channel channel) throws Exception {
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) return false;

        String credentials = Base64.getEncoder().encodeToString(
                (twitterClientId + ":" + twitterClientSecret).getBytes(StandardCharsets.UTF_8));

        String body = "grant_type=refresh_token&refresh_token=" + encode(channel.getRefreshToken())
                + "&client_id=" + encode(twitterClientId);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twitter.com/2/oauth2/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", "Basic " + credentials)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String newAccessToken = json.path("access_token").asText("");
        if (newAccessToken.isEmpty()) return false;

        channel.setAccessToken(newAccessToken);
        String newRefreshToken = json.path("refresh_token").asText("");
        if (!newRefreshToken.isEmpty()) {
            channel.setRefreshToken(newRefreshToken);
        }
        long expiresIn = json.path("expires_in").asLong(7200);
        channel.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
        channelRepository.save(channel);

        log.info("Refreshed Twitter token for channel {}", channel.getId());
        return true;
    }

    private boolean refreshYouTubeToken(Channel channel) throws Exception {
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) return false;

        String body = "grant_type=refresh_token"
                + "&refresh_token=" + encode(channel.getRefreshToken())
                + "&client_id=" + encode(youtubeClientId)
                + "&client_secret=" + encode(youtubeClientSecret);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String newAccessToken = json.path("access_token").asText("");
        if (newAccessToken.isEmpty()) return false;

        channel.setAccessToken(newAccessToken);
        long expiresIn = json.path("expires_in").asLong(3600);
        channel.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
        channelRepository.save(channel);

        log.info("Refreshed YouTube token for channel {}", channel.getId());
        return true;
    }

    private boolean refreshTikTokToken(Channel channel) throws Exception {
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) return false;

        String body = "client_key=" + encode(tiktokClientId)
                + "&client_secret=" + encode(tiktokClientSecret)
                + "&grant_type=refresh_token"
                + "&refresh_token=" + encode(channel.getRefreshToken());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/oauth/token/"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String newAccessToken = json.path("access_token").asText("");
        if (newAccessToken.isEmpty()) return false;

        channel.setAccessToken(newAccessToken);
        String newRefreshToken = json.path("refresh_token").asText("");
        if (!newRefreshToken.isEmpty()) {
            channel.setRefreshToken(newRefreshToken);
        }
        long expiresIn = json.path("expires_in").asLong(86400);
        channel.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
        channelRepository.save(channel);

        log.info("Refreshed TikTok token for channel {}", channel.getId());
        return true;
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
