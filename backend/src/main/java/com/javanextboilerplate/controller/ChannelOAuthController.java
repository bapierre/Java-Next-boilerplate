package com.javanextboilerplate.controller;

import com.javanextboilerplate.entity.Platform;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.ChannelOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/channels/oauth")
@RequiredArgsConstructor
@Slf4j
public class ChannelOAuthController {

    private final ChannelOAuthService channelOAuthService;

    @Value("${FRONTEND_URL:http://localhost:3000}")
    private String frontendUrl;

    @GetMapping("/{platform}/authorize")
    public ResponseEntity<Map<String, String>> authorize(
            @PathVariable String platform,
            @RequestParam Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        Platform platformEnum = Platform.fromValue(platform);
        String authorizationUrl = channelOAuthService.getAuthorizationUrl(
                platformEnum, projectId, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("authorizationUrl", authorizationUrl));
    }

    @GetMapping("/{platform}/callback")
    public ResponseEntity<Void> callback(
            @PathVariable String platform,
            @RequestParam String code,
            @RequestParam String state
    ) {
        try {
            Platform platformEnum = Platform.fromValue(platform);
            Long projectId = channelOAuthService.handleCallback(platformEnum, code, state);
            String redirectUrl = frontendUrl + "/dashboard/projects/" + projectId + "?connected=" + platform;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(redirectUrl))
                    .build();
        } catch (Exception e) {
            log.error("OAuth callback failed for {}: {}", platform, e.getMessage(), e);
            String errorUrl = frontendUrl + "/dashboard?error=oauth_failed&platform=" + platform;
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(errorUrl))
                    .build();
        }
    }
}
