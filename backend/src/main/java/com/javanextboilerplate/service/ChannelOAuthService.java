package com.javanextboilerplate.service;

import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.Platform;
import com.javanextboilerplate.entity.SaasProject;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChannelOAuthService {

    private final SaasProjectRepository projectRepository;
    private final ChannelRepository channelRepository;
    private final UserService userService;

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
    @Value("${LINKEDIN_CLIENT_ID:}")
    private String linkedinClientId;
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
    @Value("${LINKEDIN_CLIENT_SECRET:}")
    private String linkedinClientSecret;
    @Value("${FACEBOOK_CLIENT_SECRET:}")
    private String facebookClientSecret;

    private static final Map<Platform, String> AUTH_URLS = Map.of(
            Platform.TIKTOK, "https://www.tiktok.com/v2/auth/authorize/",
            Platform.INSTAGRAM, "https://www.facebook.com/v21.0/dialog/oauth",
            Platform.YOUTUBE, "https://accounts.google.com/o/oauth2/v2/auth",
            Platform.TWITTER, "https://twitter.com/i/oauth2/authorize",
            Platform.LINKEDIN, "https://www.linkedin.com/oauth/v2/authorization",
            Platform.FACEBOOK, "https://www.facebook.com/v21.0/dialog/oauth"
    );

    private static final Map<Platform, String> SCOPES = Map.of(
            Platform.TIKTOK, "user.info.basic,video.list",
            Platform.INSTAGRAM, "instagram_basic,instagram_manage_insights,pages_show_list",
            Platform.YOUTUBE, "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
            Platform.TWITTER, "tweet.read users.read offline.access",
            Platform.LINKEDIN, "r_liteprofile r_organization_social openid",
            Platform.FACEBOOK, "pages_show_list,pages_read_engagement,read_insights"
    );

    public String getAuthorizationUrl(Platform platform, Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);

        // Verify project belongs to user
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

        StringBuilder url = new StringBuilder(authUrl);
        url.append("?client_id=").append(encode(clientId));
        url.append("&redirect_uri=").append(encode(redirectUri));
        url.append("&response_type=code");
        url.append("&scope=").append(encode(scope));
        url.append("&state=").append(encode(state));

        // Platform-specific params
        if (platform == Platform.TWITTER) {
            url.append("&code_challenge=challenge&code_challenge_method=plain");
        }

        return url.toString();
    }

    @Transactional
    public Long handleCallback(Platform platform, String code, String state) {
        long[] parsed = parseSignedState(state);
        long projectId = parsed[0];
        long userId = parsed[1];

        SaasProject project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Invalid state: project not found"));

        // TODO: Exchange authorization code for access/refresh tokens via platform API
        // For now, create the channel with a placeholder to be completed when
        // platform API integration is implemented

        Channel channel = Channel.builder()
                .project(project)
                .platform(platform)
                .channelName("Pending setup")
                .channelId(code) // Temporary — will be replaced with real channel ID after token exchange
                .isActive(false) // Not active until token exchange is complete
                .build();

        channelRepository.save(channel);
        log.info("OAuth callback received for {} on project {} — channel created (pending token exchange)",
                platform.getValue(), projectId);

        return projectId;
    }

    private String getClientId(Platform platform) {
        return switch (platform) {
            case TIKTOK -> tiktokClientId;
            case INSTAGRAM -> instagramClientId;
            case YOUTUBE -> youtubeClientId;
            case TWITTER -> twitterClientId;
            case LINKEDIN -> linkedinClientId;
            case FACEBOOK -> facebookClientId;
        };
    }

    /**
     * Creates a signed state parameter: base64(projectId:userId:signature)
     */
    String createSignedState(Long projectId, Long userId) {
        String payload = projectId + ":" + userId;
        String signature = hmacSign(payload);
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString((payload + ":" + signature).getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Parses and validates a signed state parameter. Returns [projectId, userId].
     */
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
}
