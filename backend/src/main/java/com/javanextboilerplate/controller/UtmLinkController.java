package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreateUtmLinkRequest;
import com.javanextboilerplate.dto.response.UtmLinkResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.UtmLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/utm")
@RequiredArgsConstructor
public class UtmLinkController {

    private final UtmLinkService utmLinkService;

    @GetMapping("/links")
    public ResponseEntity<List<UtmLinkResponse>> getLinks(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(utmLinkService.getLinks(projectId, userDetails.getUserId()));
    }

    @PostMapping("/links")
    public ResponseEntity<UtmLinkResponse> createLink(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateUtmLinkRequest req,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(utmLinkService.createLink(projectId, req, userDetails.getUserId()));
    }

    /** Assign (or unassign) a UTM link to a paid ad campaign. Body: { "campaignId": 5 } or { "campaignId": null } */
    @PatchMapping("/links/{linkId}/campaign")
    public ResponseEntity<UtmLinkResponse> assignCampaign(
            @PathVariable Long projectId,
            @PathVariable Long linkId,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        Long campaignId = body.get("campaignId"); // null = unlink
        return ResponseEntity.ok(utmLinkService.assignCampaign(linkId, projectId, campaignId, userDetails.getUserId()));
    }

    @DeleteMapping("/links/{linkId}")
    public ResponseEntity<Void> deleteLink(
            @PathVariable Long projectId,
            @PathVariable Long linkId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        utmLinkService.deleteLink(linkId, projectId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
