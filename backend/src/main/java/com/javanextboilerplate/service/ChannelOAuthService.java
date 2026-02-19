package com.javanextboilerplate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.ChannelStats;
import com.javanextboilerplate.entity.Platform;
import com.javanextboilerplate.entity.SaasProject;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.ChannelStatsRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelOAuthService {

    private final SaasProjectRepository projectRepository;
    private final ChannelRepository channelRepository;
    private final ChannelStatsRepository channelStatsRepository;
    private final ChannelSyncService channelSyncService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @Value("${BACKEND_URL:http://localhost:8080}")
    private String backendUrl;

    @Value("${SUPABASE_JWT_SECRET:}")
    private String stateSigningSecret;

    // Platform client IDs
    @Value("${TIKTOK_CLIENT_ID:}")
    private String tiktokClientId;
    @Value("${INSTAGRAM_CLIENT_ID:}")
    private String instagramClientId;
    @Value("${YOUTUBE_CLIENT_ID:}")
    private String youtubeClientId;
    @Value("${TWITTER_CLIENT_ID:}")
    private String twitterClientId;
    @Value("${FACEBOOK_CLIENT_ID:}")
    private String facebookClientId;

    // Platform client secrets
    @Value("${TIKTOK_CLIENT_SECRET:}")
    private String tiktokClientSecret;
    @Value("${INSTAGRAM_CLIENT_SECRET:}")
    private String instagramClientSecret;
    @Value("${YOUTUBE_CLIENT_SECRET:}")
    private String youtubeClientSecret;
    @Value("${TWITTER_CLIENT_SECRET:}")
    private String twitterClientSecret;
    @Value("${FACEBOOK_CLIENT_SECRET:}")
    private String facebookClientSecret;

    private static final Map<Platform, String> AUTH_URLS = Map.of(
            Platform.TIKTOK, "https://www.tiktok.com/v2/auth/authorize/",
            Platform.INSTAGRAM, "https://www.facebook.com/v21.0/dialog/oauth",
            Platform.YOUTUBE, "https://accounts.google.com/o/oauth2/v2/auth",
            Platform.TWITTER, "https://twitter.com/i/oauth2/authorize",
            Platform.FACEBOOK, "https://www.facebook.com/v21.0/dialog/oauth"
    );

    private static final Map<Platform, String> SCOPES = Map.of(
            Platform.TIKTOK, "user.info.basic,user.info.profile,user.info.stats,video.list",
            Platform.INSTAGRAM, "instagram_basic,instagram_manage_insights,pages_show_list",
            Platform.YOUTUBE, "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
            Platform.TWITTER, "tweet.read users.read offline.access",
            Platform.FACEBOOK, "pages_show_list,pages_read_engagement,read_insights"
    );

    // PKCE: store code_verifier keyed by state (short-lived, in-memory is fine)
    private final ConcurrentHashMap<String, String> pkceVerifiers = new ConcurrentHashMap<>();

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // ─── Authorization URL ───

    public String getAuthorizationUrl(Platform platform, Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);

        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        String clientId = getClientId(platform);
        if (clientId == null || clientId.isBlank()) {
            throw new RuntimeException(platform.getValue() + " OAuth is not configured. Set " +
                    platform.name() + "_CLIENT_ID environment variable.");
        }

        String state = createSignedState(projectId, user.getId());
        String redirectUri = backendUrl + "/api/channels/oauth/" + platform.getValue() + "/callback";
        String scope = SCOPES.get(platform);
        String authUrl = AUTH_URLS.get(platform);

        // Generate PKCE code_verifier & code_challenge
        String codeVerifier = generateCodeVerifier();
        String codeChallenge = computeCodeChallenge(codeVerifier);
        pkceVerifiers.put(state, codeVerifier);

        StringBuilder url = new StringBuilder(authUrl);

        if (platform == Platform.TIKTOK) {
            // TikTok uses client_key, not client_id
            url.append("?client_key=").append(encode(clientId));
        } else {
            url.append("?client_id=").append(encode(clientId));
        }

        url.append("&redirect_uri=").append(encode(redirectUri));
        url.append("&response_type=code");
        url.append("&scope=").append(encode(scope));
        url.append("&state=").append(encode(state));

        // PKCE for platforms that require/support it
        if (platform == Platform.TIKTOK || platform == Platform.TWITTER) {
            url.append("&code_challenge=").append(encode(codeChallenge));
            url.append("&code_challenge_method=S256");
        }

        // YouTube/Google needs access_type=offline for refresh tokens
        if (platform == Platform.YOUTUBE) {
            url.append("&access_type=offline");
            url.append("&prompt=consent");
        }

        return url.toString();
    }

    // ─── OAuth Callback: exchange code for tokens + fetch user info ───

    @Transactional
    public Long handleCallback(Platform platform, String code, String state) {
        long[] parsed = parseSignedState(state);
        long projectId = parsed[0];
        long userId = parsed[1];

        SaasProject project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Invalid state: project not found"));

        String codeVerifier = pkceVerifiers.remove(state);

        // Exchange authorization code for tokens
        TokenResponse tokens = exchangeCodeForTokens(platform, code, codeVerifier);

        // Fetch user/channel info from the platform
        PlatformUserInfo userInfo = fetchUserInfo(platform, tokens.accessToken);

        // Use platform user ID from token response if user info API didn't return one
        String channelId = !"unknown".equals(userInfo.platformUserId) ? userInfo.platformUserId
                : (tokens.platformUserId != null ? tokens.platformUserId : "unknown");

        // Upsert: reactivate existing channel (e.g. previously marked inactive) rather than failing
        // with a unique constraint violation on (project_id, platform, channel_id).
        Channel channel = channelRepository
                .findByProjectIdAndPlatformAndChannelId(project.getId(), platform, channelId)
                .orElse(null);

        if (channel != null) {
            channel.setChannelName(userInfo.displayName);
            channel.setChannelUrl(userInfo.profileUrl);
            channel.setAccessToken(tokens.accessToken);
            channel.setRefreshToken(tokens.refreshToken);
            channel.setTokenExpiresAt(tokens.expiresAt);
            channel.setFollowerCount(userInfo.followerCount);
            channel.setIsActive(true);
            log.info("Reactivating existing {} channel {} on project {}",
                    platform.getValue(), channel.getId(), projectId);
        } else {
            channel = Channel.builder()
                    .project(project)
                    .platform(platform)
                    .channelName(userInfo.displayName)
                    .channelId(channelId)
                    .channelUrl(userInfo.profileUrl)
                    .accessToken(tokens.accessToken)
                    .refreshToken(tokens.refreshToken)
                    .tokenExpiresAt(tokens.expiresAt)
                    .followerCount(userInfo.followerCount)
                    .isActive(true)
                    .build();
        }

        final Channel savedChannel = channelRepository.save(channel);
        log.info("OAuth completed for {} — connected '{}' on project {}",
                platform.getValue(), userInfo.displayName, projectId);

        // Save an immediate follower-count snapshot inside this transaction.
        // This guarantees a data point even if the afterCommit sync below fails.
        if (userInfo.followerCount() != null && userInfo.followerCount() > 0) {
            channelStatsRepository.save(ChannelStats.builder()
                    .channel(savedChannel)
                    .recordedAt(LocalDateTime.now())
                    .followersCount(userInfo.followerCount())
                    .build());
        }

        // Trigger initial sync AFTER transaction commits so a sync failure can't roll back the channel save
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    channelSyncService.syncChannel(savedChannel);
                } catch (Exception e) {
                    log.warn("Initial sync failed for new channel {} (non-fatal): {}", savedChannel.getId(), e.getMessage());
                }
            }
        });

        return projectId;
    }

    // ─── Token Exchange ───

    private TokenResponse exchangeCodeForTokens(Platform platform, String code, String codeVerifier) {
        String redirectUri = backendUrl + "/api/channels/oauth/" + platform.getValue() + "/callback";

        try {
            return switch (platform) {
                case TIKTOK -> exchangeTikTokToken(code, codeVerifier, redirectUri);
                case TWITTER -> exchangeTwitterToken(code, codeVerifier, redirectUri);
                case YOUTUBE -> exchangeGoogleToken(code, redirectUri);
                case INSTAGRAM -> exchangeInstagramToken(code, redirectUri);
                case FACEBOOK -> exchangeFacebookToken(code, redirectUri);
            };
        } catch (Exception e) {
            log.error("Token exchange failed for {}: {}", platform.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to exchange authorization code for " + platform.getValue(), e);
        }
    }

    private TokenResponse exchangeTikTokToken(String code, String codeVerifier, String redirectUri) throws Exception {
        String body = "client_key=" + encode(tiktokClientId)
                + "&client_secret=" + encode(tiktokClientSecret)
                + "&code=" + encode(code)
                + "&grant_type=authorization_code"
                + "&redirect_uri=" + encode(redirectUri)
                + "&code_verifier=" + encode(codeVerifier);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/oauth/token/"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        String refreshToken = json.path("refresh_token").asText();
        String openId = json.path("open_id").asText();
        long expiresIn = json.path("expires_in").asLong(86400);

        if (accessToken.isEmpty()) {
            throw new RuntimeException("TikTok token exchange failed: " + response.body());
        }

        return new TokenResponse(accessToken, refreshToken, LocalDateTime.now().plusSeconds(expiresIn), openId);
    }

    private TokenResponse exchangeTwitterToken(String code, String codeVerifier, String redirectUri) throws Exception {
        String body = "code=" + encode(code)
                + "&grant_type=authorization_code"
                + "&redirect_uri=" + encode(redirectUri)
                + "&code_verifier=" + encode(codeVerifier != null ? codeVerifier : "challenge")
                + "&client_id=" + encode(twitterClientId);

        // Twitter requires Basic auth: base64(client_id:client_secret)
        String credentials = Base64.getEncoder().encodeToString(
                (twitterClientId + ":" + twitterClientSecret).getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twitter.com/2/oauth2/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", "Basic " + credentials)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        String refreshToken = json.path("refresh_token").asText();
        long expiresIn = json.path("expires_in").asLong(7200);

        if (accessToken.isEmpty()) {
            throw new RuntimeException("Twitter token exchange failed: " + response.body());
        }

        if (refreshToken.isEmpty()) {
            log.warn("Twitter OAuth did not return a refresh_token for the new connection — " +
                    "ensure 'offline.access' scope is granted and the app has Offline Access enabled " +
                    "in the Twitter developer portal. Without a refresh token, the access token cannot " +
                    "be automatically renewed when it expires (~2 hours).");
        } else {
            log.info("Twitter OAuth returned a refresh_token — offline access is working correctly");
        }

        return new TokenResponse(accessToken, refreshToken, LocalDateTime.now().plusSeconds(expiresIn), null);
    }

    private TokenResponse exchangeGoogleToken(String code, String redirectUri) throws Exception {
        String body = "code=" + encode(code)
                + "&client_id=" + encode(youtubeClientId)
                + "&client_secret=" + encode(youtubeClientSecret)
                + "&redirect_uri=" + encode(redirectUri)
                + "&grant_type=authorization_code";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://oauth2.googleapis.com/token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        String refreshToken = json.path("refresh_token").asText();
        long expiresIn = json.path("expires_in").asLong(3600);

        if (accessToken.isEmpty()) {
            throw new RuntimeException("Google token exchange failed: " + response.body());
        }

        return new TokenResponse(accessToken, refreshToken, LocalDateTime.now().plusSeconds(expiresIn), null);
    }

    private TokenResponse exchangeInstagramToken(String code, String redirectUri) throws Exception {
        String body = "client_id=" + encode(instagramClientId)
                + "&client_secret=" + encode(instagramClientSecret)
                + "&grant_type=authorization_code"
                + "&redirect_uri=" + encode(redirectUri)
                + "&code=" + encode(code);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.instagram.com/oauth/access_token"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        // Instagram short-lived tokens don't have refresh_token — exchange for long-lived
        if (!accessToken.isEmpty()) {
            return exchangeInstagramLongLivedToken(accessToken);
        }

        throw new RuntimeException("Instagram token exchange failed: " + response.body());
    }

    private TokenResponse exchangeInstagramLongLivedToken(String shortLivedToken) throws Exception {
        String url = "https://graph.instagram.com/access_token"
                + "?grant_type=ig_exchange_token"
                + "&client_secret=" + encode(instagramClientSecret)
                + "&access_token=" + encode(shortLivedToken);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        long expiresIn = json.path("expires_in").asLong(5184000); // ~60 days

        return new TokenResponse(accessToken, null, LocalDateTime.now().plusSeconds(expiresIn), null);
    }

    private TokenResponse exchangeFacebookToken(String code, String redirectUri) throws Exception {
        String url = "https://graph.facebook.com/v21.0/oauth/access_token"
                + "?client_id=" + encode(facebookClientId)
                + "&redirect_uri=" + encode(redirectUri)
                + "&client_secret=" + encode(facebookClientSecret)
                + "&code=" + encode(code);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String accessToken = json.path("access_token").asText();
        long expiresIn = json.path("expires_in").asLong(5184000);

        if (accessToken.isEmpty()) {
            throw new RuntimeException("Facebook token exchange failed: " + response.body());
        }

        return new TokenResponse(accessToken, null, LocalDateTime.now().plusSeconds(expiresIn), null);
    }

    // ─── Fetch User Info ───

    private PlatformUserInfo fetchUserInfo(Platform platform, String accessToken) {
        try {
            return switch (platform) {
                case TIKTOK -> fetchTikTokUser(accessToken);
                case TWITTER -> fetchTwitterUser(accessToken);
                case YOUTUBE -> fetchYouTubeUser(accessToken);
                case INSTAGRAM -> fetchInstagramUser(accessToken);
                case FACEBOOK -> fetchFacebookUser(accessToken);
            };
        } catch (Exception e) {
            log.warn("Failed to fetch user info for {}, using fallback: {}", platform.getValue(), e.getMessage());
            return new PlatformUserInfo("Unknown", "unknown", null, null);
        }
    }

    private PlatformUserInfo fetchTikTokUser(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/user/info/?fields=open_id,username,display_name,avatar_url,follower_count"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        log.info("TikTok user info response [status={}]: {}", response.statusCode(), response.body());
        JsonNode json = objectMapper.readTree(response.body());

        // Check for API errors
        JsonNode error = json.path("error");
        if (error.has("code") && !"ok".equals(error.path("code").asText())) {
            log.warn("TikTok API error: code={}, message={}", error.path("code").asText(), error.path("message").asText());
        }

        JsonNode data = json.path("data").path("user");

        String displayName = data.path("display_name").asText("");
        String username = data.path("username").asText("");
        String openId = data.path("open_id").asText("unknown");
        long followers = data.path("follower_count").asLong(0);

        log.info("TikTok user parsed: displayName='{}', username='{}', openId='{}', followers={}", displayName, username, openId, followers);

        // Prefer display_name, fall back to username
        String name = !displayName.isEmpty() ? displayName : (!username.isEmpty() ? "@" + username : "TikTok User");
        String handle = !username.isEmpty() ? username : displayName;

        return new PlatformUserInfo(name, openId, "https://www.tiktok.com/@" + handle, followers > 0 ? followers : null);
    }

    private PlatformUserInfo fetchTwitterUser(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twitter.com/2/users/me?user.fields=public_metrics"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        log.info("Twitter user info response [status={}]: {}", response.statusCode(), response.body());
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode data = json.path("data");

        String username = data.path("username").asText(data.path("name").asText("X Account"));
        String id = data.path("id").asText("unknown");

        long followers = data.path("public_metrics").path("followers_count").asLong(0);
        return new PlatformUserInfo("@" + username, id, "https://x.com/" + username, followers > 0 ? followers : null);
    }

    private PlatformUserInfo fetchYouTubeUser(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());
        JsonNode items = json.path("items");

        if (items.isArray() && !items.isEmpty()) {
            JsonNode channel = items.get(0);
            String title = channel.path("snippet").path("title").asText("YouTube Channel");
            String channelId = channel.path("id").asText("unknown");
            String customUrl = channel.path("snippet").path("customUrl").asText("");
            String profileUrl = customUrl.isEmpty()
                    ? "https://www.youtube.com/channel/" + channelId
                    : "https://www.youtube.com/" + customUrl;
            long subscribers = channel.path("statistics").path("subscriberCount").asLong(0);
            return new PlatformUserInfo(title, channelId, profileUrl, subscribers > 0 ? subscribers : null);
        }

        return new PlatformUserInfo("YouTube Channel", "unknown", null, null);
    }

    private PlatformUserInfo fetchInstagramUser(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://graph.instagram.com/me?fields=id,username,followers_count&access_token=" + encode(accessToken)))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String username = json.path("username").asText("Instagram User");
        String id = json.path("id").asText("unknown");
        long followers = json.path("followers_count").asLong(0);

        return new PlatformUserInfo("@" + username, id, "https://www.instagram.com/" + username, followers > 0 ? followers : null);
    }

    private PlatformUserInfo fetchFacebookUser(String accessToken) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://graph.facebook.com/v21.0/me?fields=id,name&access_token=" + encode(accessToken)))
                .GET()
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode json = objectMapper.readTree(response.body());

        String name = json.path("name").asText("Facebook User");
        String id = json.path("id").asText("unknown");

        return new PlatformUserInfo(name, id, "https://www.facebook.com/" + id, null);
    }

    // ─── Token Revocation (called on disconnect) ───

    public void revokeToken(Channel channel) {
        if (channel.getAccessToken() == null || channel.getAccessToken().isBlank()) return;

        try {
            switch (channel.getPlatform()) {
                case TIKTOK -> revokeTikTokToken(channel.getAccessToken());
                case TWITTER -> revokeTwitterToken(channel.getAccessToken());
                // Google, Instagram, Facebook — no simple revoke endpoint needed for MVP
                default -> log.debug("No revoke endpoint for {}", channel.getPlatform().getValue());
            }
        } catch (Exception e) {
            log.warn("Failed to revoke {} token (non-fatal): {}", channel.getPlatform().getValue(), e.getMessage());
        }
    }

    private void revokeTikTokToken(String accessToken) throws Exception {
        String body = "client_key=" + encode(tiktokClientId)
                + "&access_token=" + encode(accessToken);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://open.tiktokapis.com/v2/oauth/revoke/"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        log.info("TikTok token revoked [status={}]", response.statusCode());
    }

    private void revokeTwitterToken(String accessToken) throws Exception {
        String credentials = Base64.getEncoder().encodeToString(
                (twitterClientId + ":" + twitterClientSecret).getBytes(StandardCharsets.UTF_8));

        String body = "token=" + encode(accessToken) + "&token_type_hint=access_token";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twitter.com/2/oauth2/revoke"))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("Authorization", "Basic " + credentials)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        log.info("Twitter token revoked [status={}]", response.statusCode());
    }

    // ─── Helpers ───

    private String getClientId(Platform platform) {
        return switch (platform) {
            case TIKTOK -> tiktokClientId;
            case INSTAGRAM -> instagramClientId;
            case YOUTUBE -> youtubeClientId;
            case TWITTER -> twitterClientId;
            case FACEBOOK -> facebookClientId;
        };
    }

    /**
     * Generates a cryptographically random PKCE code_verifier (43-128 chars).
     */
    private String generateCodeVerifier() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Computes code_challenge = BASE64URL(SHA256(code_verifier)).
     */
    private String computeCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute PKCE code challenge", e);
        }
    }

    String createSignedState(Long projectId, Long userId) {
        String payload = projectId + ":" + userId;
        String signature = hmacSign(payload);
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString((payload + ":" + signature).getBytes(StandardCharsets.UTF_8));
    }

    long[] parseSignedState(String state) {
        String decoded = new String(Base64.getUrlDecoder().decode(state), StandardCharsets.UTF_8);
        String[] parts = decoded.split(":");
        if (parts.length != 3) {
            throw new RuntimeException("Invalid OAuth state");
        }
        String payload = parts[0] + ":" + parts[1];
        String expectedSignature = hmacSign(payload);
        if (!expectedSignature.equals(parts[2])) {
            throw new RuntimeException("Invalid OAuth state signature");
        }
        return new long[]{Long.parseLong(parts[0]), Long.parseLong(parts[1])};
    }

    private String hmacSign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(stateSigningSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign OAuth state", e);
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    // ─── Inner DTOs ───

    private record TokenResponse(String accessToken, String refreshToken, LocalDateTime expiresAt, String platformUserId) {}
    private record PlatformUserInfo(String displayName, String platformUserId, String profileUrl, Long followerCount) {}
}
