package com.javanextboilerplate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.ChannelStats;
import com.javanextboilerplate.entity.Post;
import com.javanextboilerplate.entity.PostStats;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.ChannelStatsRepository;
import com.javanextboilerplate.repository.PostRepository;
import com.javanextboilerplate.repository.PostStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelSyncService {

    private final ChannelRepository channelRepository;
    private final ChannelStatsRepository channelStatsRepository;
    private final PostRepository postRepository;
    private final PostStatsRepository postStatsRepository;
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

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
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

    // NOTE: No @Transactional here by design — this method makes external HTTP calls (up to 15s each).
    // Wrapping in a transaction would hold a DB connection for the entire duration, exhausting the pool.
    // Each repository.save() call below uses its own short-lived transaction.
    public void syncChannel(Channel channel) throws Exception {
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

        // Sync recent posts
        try {
            syncPosts(channel);
        } catch (Exception e) {
            log.warn("Post sync failed for channel {} ({}): {}",
                    channel.getId(), channel.getPlatform().getValue(), e.getMessage());
        }
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
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
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
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
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
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode errorCode = json.path("error").path("code");
        if (!errorCode.isMissingNode() && !"ok".equals(errorCode.asText())) {
            throw new RuntimeException("TikTok error " + errorCode.asText() + ": " + response.body());
        }
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
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
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
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());
        }
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode data = json.path("data");
        if (data.isArray() && !data.isEmpty()) {
            return data.get(0).path("fan_count").asLong(0);
        }
        return null;
    }

    // ─── Token Refresh ───

    private boolean refreshToken(Channel channel) throws Exception {
        // Do NOT catch exceptions here.
        // Transient errors (network timeout, rate-limit, unexpected HTTP response) should
        // propagate to syncAllChannels' outer try-catch, which logs a warning and moves on
        // WITHOUT marking the channel inactive.  Only return false for known-permanent
        // failures (no refresh token, or an OAuth error like invalid_grant), which tells
        // syncChannel to mark the channel inactive.
        return switch (channel.getPlatform()) {
            case TWITTER -> refreshTwitterToken(channel);
            case YOUTUBE -> refreshYouTubeToken(channel);
            case TIKTOK  -> refreshTikTokToken(channel);
            case INSTAGRAM, FACEBOOK -> false; // No refresh token flow — must reconnect
        };
    }

    private boolean refreshTwitterToken(Channel channel) throws Exception {
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) {
            log.warn("Twitter channel {} has no refresh token — marking inactive", channel.getId());
            return false; // Permanent — user must reconnect
        }

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
        if (newAccessToken.isEmpty()) {
            String error = json.path("error").asText("");
            // invalid_grant / invalid_client = refresh token revoked or expired — permanent
            if ("invalid_grant".equals(error) || "invalid_client".equals(error)) {
                log.warn("Twitter token refresh permanent failure for channel {} ({}): marking inactive",
                        channel.getId(), error);
                return false;
            }
            // Any other failure (rate-limit, server error, etc.) — throw so the caller treats it as transient
            throw new RuntimeException("Twitter token refresh failed [HTTP " + response.statusCode() + "]: " + response.body());
        }

        channel.setAccessToken(newAccessToken);
        // Twitter rotates refresh tokens — always save the new one if provided
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
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) {
            log.warn("YouTube channel {} has no refresh token — marking inactive", channel.getId());
            return false;
        }

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
        if (newAccessToken.isEmpty()) {
            String error = json.path("error").asText("");
            if ("invalid_grant".equals(error) || "invalid_client".equals(error)) {
                log.warn("YouTube token refresh permanent failure for channel {} ({}): marking inactive",
                        channel.getId(), error);
                return false;
            }
            throw new RuntimeException("YouTube token refresh failed [HTTP " + response.statusCode() + "]: " + response.body());
        }

        channel.setAccessToken(newAccessToken);
        long expiresIn = json.path("expires_in").asLong(3600);
        channel.setTokenExpiresAt(LocalDateTime.now().plusSeconds(expiresIn));
        channelRepository.save(channel);

        log.info("Refreshed YouTube token for channel {}", channel.getId());
        return true;
    }

    private boolean refreshTikTokToken(Channel channel) throws Exception {
        if (channel.getRefreshToken() == null || channel.getRefreshToken().isBlank()) {
            log.warn("TikTok channel {} has no refresh token — marking inactive", channel.getId());
            return false;
        }

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
        if (newAccessToken.isEmpty()) {
            String errorCode = json.path("error_code").asText(json.path("error").asText(""));
            // TikTok uses numeric error codes; 10010 = invalid refresh token (permanent)
            if (!errorCode.isEmpty() && (errorCode.equals("10010") || errorCode.equals("invalid_grant"))) {
                log.warn("TikTok token refresh permanent failure for channel {} (code={}): marking inactive",
                        channel.getId(), errorCode);
                return false;
            }
            throw new RuntimeException("TikTok token refresh failed [HTTP " + response.statusCode() + "]: " + response.body());
        }

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

    // ─── Post Syncing ───

    private record RawPost(
            String platformPostId,
            String title,
            String description,
            String postUrl,
            String thumbnailUrl,
            Integer durationSeconds,
            LocalDateTime publishedAt,
            Long views,
            Long likes,
            Long comments,
            Long shares
    ) {}

    private void syncPosts(Channel channel) {
        List<RawPost> rawPosts = fetchRecentPosts(channel);
        if (rawPosts.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        int created = 0;
        int updated = 0;

        for (RawPost raw : rawPosts) {
            // Upsert post
            Post post = postRepository.findByChannelIdAndPlatformPostId(channel.getId(), raw.platformPostId())
                    .orElse(null);

            if (post == null) {
                post = Post.builder()
                        .channel(channel)
                        .platformPostId(raw.platformPostId())
                        .title(raw.title())
                        .description(raw.description())
                        .postUrl(raw.postUrl())
                        .thumbnailUrl(raw.thumbnailUrl())
                        .durationSeconds(raw.durationSeconds())
                        .publishedAt(raw.publishedAt() != null ? raw.publishedAt() : now)
                        .build();
                post = postRepository.save(post);
                created++;
            } else {
                if (raw.title() != null) post.setTitle(raw.title());
                if (raw.description() != null) post.setDescription(raw.description());
                if (raw.postUrl() != null) post.setPostUrl(raw.postUrl());
                if (raw.thumbnailUrl() != null) post.setThumbnailUrl(raw.thumbnailUrl());
                if (raw.durationSeconds() != null) post.setDurationSeconds(raw.durationSeconds());
                post = postRepository.save(post);
                updated++;
            }

            // Save stats snapshot
            PostStats stats = PostStats.builder()
                    .post(post)
                    .recordedAt(now)
                    .viewsCount(raw.views() != null ? raw.views() : 0L)
                    .likesCount(raw.likes() != null ? raw.likes() : 0L)
                    .commentsCount(raw.comments() != null ? raw.comments() : 0L)
                    .sharesCount(raw.shares() != null ? raw.shares() : 0L)
                    .build();
            postStatsRepository.save(stats);
        }

        log.debug("Post sync for channel {} ({}): {} created, {} updated",
                channel.getId(), channel.getPlatform().getValue(), created, updated);
    }

    private List<RawPost> fetchRecentPosts(Channel channel) {
        try {
            return switch (channel.getPlatform()) {
                case TWITTER -> Collections.emptyList(); // Free tier doesn't include tweet.read
                case YOUTUBE -> fetchYouTubePosts(channel.getAccessToken());
                case TIKTOK -> fetchTikTokPosts(channel.getAccessToken());
                case INSTAGRAM -> fetchInstagramPosts(channel.getAccessToken());
                case FACEBOOK -> fetchFacebookPosts(channel.getAccessToken());
            };
        } catch (Exception e) {
            log.warn("Failed to fetch posts for {} channel {}: {}",
                    channel.getPlatform().getValue(), channel.getId(), e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<RawPost> fetchYouTubePosts(String accessToken) throws Exception {
        // Step 1: Search for recent videos
        HttpRequest searchRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=10&order=date"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> searchResponse = HTTP_CLIENT.send(searchRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode searchJson = objectMapper.readTree(searchResponse.body());
        JsonNode items = searchJson.path("items");

        if (!items.isArray() || items.isEmpty()) return Collections.emptyList();

        // Collect video IDs
        String videoIds = new ArrayList<String>() {{
            for (JsonNode item : items) {
                add(item.path("id").path("videoId").asText());
            }
        }}.stream().filter(id -> !id.isEmpty()).collect(Collectors.joining(","));

        if (videoIds.isEmpty()) return Collections.emptyList();

        // Step 2: Get video stats and details
        HttpRequest detailsRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=" + encode(videoIds)))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> detailsResponse = HTTP_CLIENT.send(detailsRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode detailsJson = objectMapper.readTree(detailsResponse.body());
        JsonNode videoItems = detailsJson.path("items");

        if (!videoItems.isArray()) return Collections.emptyList();

        List<RawPost> posts = new ArrayList<>();
        for (JsonNode video : videoItems) {
            String videoId = video.path("id").asText();
            JsonNode snippet = video.path("snippet");
            JsonNode stats = video.path("statistics");
            JsonNode contentDetails = video.path("contentDetails");

            LocalDateTime publishedAt = null;
            String publishedAtStr = snippet.path("publishedAt").asText("");
            if (!publishedAtStr.isEmpty()) {
                publishedAt = LocalDateTime.parse(publishedAtStr.replace("Z", "").split("\\.")[0]);
            }

            Integer durationSeconds = parseDuration(contentDetails.path("duration").asText(""));

            posts.add(new RawPost(
                    videoId,
                    snippet.path("title").asText(""),
                    snippet.path("description").asText(""),
                    "https://www.youtube.com/watch?v=" + videoId,
                    snippet.path("thumbnails").path("medium").path("url").asText(null),
                    durationSeconds,
                    publishedAt,
                    stats.path("viewCount").asLong(0),
                    stats.path("likeCount").asLong(0),
                    stats.path("commentCount").asLong(0),
                    0L
            ));
        }
        return posts;
    }

    private List<RawPost> fetchTikTokPosts(String accessToken) throws Exception {
        // Step 1: Get video list
        String listBody = objectMapper.writeValueAsString(java.util.Map.of(
                "max_count", 10
        ));

        HttpRequest listRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/video/list/?fields=id,title,create_time,cover_image_url,duration,share_url"))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(listBody))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> listResponse = HTTP_CLIENT.send(listRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode listJson = objectMapper.readTree(listResponse.body());
        JsonNode videos = listJson.path("data").path("videos");

        if (!videos.isArray() || videos.isEmpty()) return Collections.emptyList();

        // Collect video IDs for stats query
        List<String> videoIds = new ArrayList<>();
        for (JsonNode v : videos) {
            String id = v.path("id").asText("");
            if (!id.isEmpty()) videoIds.add(id);
        }

        // Step 2: Get video stats
        java.util.Map<String, Long> viewsMap = new java.util.HashMap<>();
        java.util.Map<String, Long> likesMap = new java.util.HashMap<>();
        java.util.Map<String, Long> commentsMap = new java.util.HashMap<>();
        java.util.Map<String, Long> sharesMap = new java.util.HashMap<>();

        if (!videoIds.isEmpty()) {
            String queryBody = objectMapper.writeValueAsString(java.util.Map.of(
                    "filters", java.util.Map.of("video_ids", videoIds)
            ));

            HttpRequest queryRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://open.tiktokapis.com/v2/video/query/?fields=id,like_count,comment_count,share_count,view_count"))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(queryBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> queryResponse = HTTP_CLIENT.send(queryRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode queryJson = objectMapper.readTree(queryResponse.body());
            JsonNode statsVideos = queryJson.path("data").path("videos");

            if (statsVideos.isArray()) {
                for (JsonNode sv : statsVideos) {
                    String id = sv.path("id").asText();
                    viewsMap.put(id, sv.path("view_count").asLong(0));
                    likesMap.put(id, sv.path("like_count").asLong(0));
                    commentsMap.put(id, sv.path("comment_count").asLong(0));
                    sharesMap.put(id, sv.path("share_count").asLong(0));
                }
            }
        }

        List<RawPost> posts = new ArrayList<>();
        for (JsonNode video : videos) {
            String id = video.path("id").asText();
            long createTime = video.path("create_time").asLong(0);
            LocalDateTime publishedAt = createTime > 0
                    ? LocalDateTime.ofInstant(Instant.ofEpochSecond(createTime), ZoneOffset.UTC)
                    : null;

            posts.add(new RawPost(
                    id,
                    video.path("title").asText(""),
                    null,
                    video.path("share_url").asText(null),
                    video.path("cover_image_url").asText(null),
                    video.path("duration").asInt(0) > 0 ? video.path("duration").asInt() : null,
                    publishedAt,
                    viewsMap.getOrDefault(id, 0L),
                    likesMap.getOrDefault(id, 0L),
                    commentsMap.getOrDefault(id, 0L),
                    sharesMap.getOrDefault(id, 0L)
            ));
        }
        return posts;
    }

    private List<RawPost> fetchInstagramPosts(String accessToken) throws Exception {
        // Step 1: Get recent media
        String url = "https://graph.instagram.com/me/media?fields=id,caption,timestamp,media_url,permalink,thumbnail_url&limit=10&access_token="
                + encode(accessToken);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode data = json.path("data");

        if (!data.isArray() || data.isEmpty()) return Collections.emptyList();

        List<RawPost> posts = new ArrayList<>();
        for (JsonNode media : data) {
            String mediaId = media.path("id").asText();

            // Step 2: Get engagement stats for each media
            long likes = 0;
            long comments = 0;
            try {
                String statsUrl = "https://graph.instagram.com/" + mediaId
                        + "?fields=like_count,comments_count&access_token=" + encode(accessToken);

                HttpRequest statsRequest = HttpRequest.newBuilder()
                        .uri(URI.create(statsUrl))
                        .GET()
                        .timeout(Duration.ofSeconds(15))
                        .build();

                HttpResponse<String> statsResponse = HTTP_CLIENT.send(statsRequest, HttpResponse.BodyHandlers.ofString());
                JsonNode statsJson = objectMapper.readTree(statsResponse.body());
                likes = statsJson.path("like_count").asLong(0);
                comments = statsJson.path("comments_count").asLong(0);
            } catch (Exception e) {
                log.debug("Failed to fetch Instagram media stats for {}: {}", mediaId, e.getMessage());
            }

            LocalDateTime publishedAt = null;
            String timestamp = media.path("timestamp").asText("");
            if (!timestamp.isEmpty()) {
                publishedAt = LocalDateTime.parse(timestamp.replace("Z", "").split("\\+")[0].split("\\.")[0]);
            }

            String caption = media.path("caption").asText("");
            String title = caption.length() > 500 ? caption.substring(0, 500) : caption;
            String thumbnail = media.path("thumbnail_url").asText(null);
            if (thumbnail == null) {
                thumbnail = media.path("media_url").asText(null);
            }

            posts.add(new RawPost(
                    mediaId,
                    title,
                    null,
                    media.path("permalink").asText(null),
                    thumbnail,
                    null,
                    publishedAt,
                    0L, // Instagram doesn't expose view count for all media types
                    likes,
                    comments,
                    0L
            ));
        }
        return posts;
    }

    private List<RawPost> fetchFacebookPosts(String accessToken) throws Exception {
        // Step 1: Get page ID
        String accountsUrl = "https://graph.facebook.com/v21.0/me/accounts?fields=id&limit=1&access_token="
                + encode(accessToken);

        HttpRequest accountsRequest = HttpRequest.newBuilder()
                .uri(URI.create(accountsUrl))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> accountsResponse = HTTP_CLIENT.send(accountsRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode accountsJson = objectMapper.readTree(accountsResponse.body());
        JsonNode accountsData = accountsJson.path("data");

        if (!accountsData.isArray() || accountsData.isEmpty()) return Collections.emptyList();

        String pageId = accountsData.get(0).path("id").asText("");
        String pageAccessToken = accountsData.get(0).path("access_token").asText(accessToken);

        if (pageId.isEmpty()) return Collections.emptyList();

        // Step 2: Get page posts
        String postsUrl = "https://graph.facebook.com/v21.0/" + pageId
                + "/posts?fields=id,message,created_time,permalink_url,full_picture&limit=10&access_token="
                + encode(pageAccessToken);

        HttpRequest postsRequest = HttpRequest.newBuilder()
                .uri(URI.create(postsUrl))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> postsResponse = HTTP_CLIENT.send(postsRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode postsJson = objectMapper.readTree(postsResponse.body());
        JsonNode postsData = postsJson.path("data");

        if (!postsData.isArray() || postsData.isEmpty()) return Collections.emptyList();

        List<RawPost> posts = new ArrayList<>();
        for (JsonNode fbPost : postsData) {
            String postId = fbPost.path("id").asText();

            // Step 3: Get engagement stats
            long likes = 0;
            long comments = 0;
            long shares = 0;
            try {
                String statsUrl = "https://graph.facebook.com/v21.0/" + postId
                        + "?fields=likes.limit(0).summary(true),comments.limit(0).summary(true),shares&access_token="
                        + encode(pageAccessToken);

                HttpRequest statsRequest = HttpRequest.newBuilder()
                        .uri(URI.create(statsUrl))
                        .GET()
                        .timeout(Duration.ofSeconds(15))
                        .build();

                HttpResponse<String> statsResponse = HTTP_CLIENT.send(statsRequest, HttpResponse.BodyHandlers.ofString());
                JsonNode statsJson = objectMapper.readTree(statsResponse.body());
                likes = statsJson.path("likes").path("summary").path("total_count").asLong(0);
                comments = statsJson.path("comments").path("summary").path("total_count").asLong(0);
                shares = statsJson.path("shares").path("count").asLong(0);
            } catch (Exception e) {
                log.debug("Failed to fetch Facebook post stats for {}: {}", postId, e.getMessage());
            }

            LocalDateTime publishedAt = null;
            String createdTime = fbPost.path("created_time").asText("");
            if (!createdTime.isEmpty()) {
                publishedAt = LocalDateTime.parse(createdTime.replace("Z", "").split("\\+")[0].split("\\.")[0]);
            }

            String message = fbPost.path("message").asText("");
            String title = message.length() > 500 ? message.substring(0, 500) : message;

            posts.add(new RawPost(
                    postId,
                    title,
                    null,
                    fbPost.path("permalink_url").asText(null),
                    fbPost.path("full_picture").asText(null),
                    null,
                    publishedAt,
                    0L, // Facebook doesn't easily expose view count for regular posts
                    likes,
                    comments,
                    shares
            ));
        }
        return posts;
    }

    /**
     * Parse ISO 8601 duration (e.g., "PT1H2M3S") to seconds.
     */
    private static Integer parseDuration(String iso8601) {
        if (iso8601 == null || iso8601.isEmpty()) return null;
        try {
            return (int) Duration.parse(iso8601).getSeconds();
        } catch (Exception e) {
            return null;
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
