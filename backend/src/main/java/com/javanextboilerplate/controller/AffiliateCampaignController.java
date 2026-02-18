package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreateCampaignRequest;
import com.javanextboilerplate.dto.response.CampaignResponse;
import com.javanextboilerplate.dto.response.CampaignStatsResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.AffiliateCampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/affiliate")
@RequiredArgsConstructor
public class AffiliateCampaignController {

    private final AffiliateCampaignService affiliateService;

    @GetMapping("/campaigns")
    public ResponseEntity<List<CampaignResponse>> getCampaigns(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(affiliateService.getCampaigns(projectId, userDetails.getUserId()));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<CampaignResponse> createCampaign(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateCampaignRequest req,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(affiliateService.createCampaign(projectId, req, userDetails.getUserId()));
    }

    @DeleteMapping("/campaigns/{campaignId}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        affiliateService.deleteCampaign(campaignId, projectId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/campaigns/{campaignId}/stats")
    public ResponseEntity<CampaignStatsResponse> getStats(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(affiliateService.getStats(campaignId, projectId, userDetails.getUserId(), days));
    }
}
