package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.response.SeoAuditResponse;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.SeoAuditService;
import com.javanextboilerplate.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/seo")
@RequiredArgsConstructor
@Slf4j
public class SeoAuditController {

    private final SeoAuditService seoAuditService;
    private final UserService userService;
    private final SaasProjectRepository projectRepository;

    /** Returns the latest persisted audit for the project, or 204 if none exists. */
    @GetMapping("/audit")
    public ResponseEntity<?> getLatest(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        User user = userService.getUserBySupabaseId(userDetails.getUserId());
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return seoAuditService.getLatest(projectId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Runs a fresh audit using the project's website URL and persists it. */
    @PostMapping("/audit")
    public ResponseEntity<?> runAudit(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        User user = userService.getUserBySupabaseId(userDetails.getUserId());
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        try {
            SeoAuditResponse result = seoAuditService.runAudit(projectId);
            return ResponseEntity.ok(result);
        } catch (SeoAuditService.RateLimitException e) {
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Rate limit: please wait before running another audit",
                    "secondsLeft", e.getSecondsLeft()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.warn("SEO audit failed for project {}: {}", projectId, e.getMessage());
            return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
        }
    }
}
