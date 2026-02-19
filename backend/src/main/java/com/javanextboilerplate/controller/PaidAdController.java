package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreatePaidAdCampaignRequest;
import com.javanextboilerplate.dto.request.CreatePaidAdEntryRequest;
import com.javanextboilerplate.dto.response.PaidAdCampaignResponse;
import com.javanextboilerplate.dto.response.PaidAdEntryResponse;
import com.javanextboilerplate.dto.response.PaidAdStatsResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.PaidAdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{projectId}/paid-ads")
@RequiredArgsConstructor
public class PaidAdController {

    private final PaidAdService paidAdService;

    // ── Campaigns ─────────────────────────────────────────────────────────────

    @GetMapping("/campaigns")
    public ResponseEntity<List<PaidAdCampaignResponse>> getCampaigns(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(paidAdService.getCampaigns(projectId, userDetails.getUserId()));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<PaidAdCampaignResponse> createCampaign(
            @PathVariable Long projectId,
            @Valid @RequestBody CreatePaidAdCampaignRequest req,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(paidAdService.createCampaign(projectId, req, userDetails.getUserId()));
    }

    @DeleteMapping("/campaigns/{campaignId}")
    public ResponseEntity<Void> deleteCampaign(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        paidAdService.deleteCampaign(campaignId, projectId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    @GetMapping("/campaigns/{campaignId}/entries")
    public ResponseEntity<List<PaidAdEntryResponse>> getEntries(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(paidAdService.getEntries(campaignId, projectId, userDetails.getUserId()));
    }

    @PostMapping("/campaigns/{campaignId}/entries")
    public ResponseEntity<PaidAdEntryResponse> upsertEntry(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @Valid @RequestBody CreatePaidAdEntryRequest req,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(paidAdService.upsertEntry(campaignId, projectId, req, userDetails.getUserId()));
    }

    @DeleteMapping("/campaigns/{campaignId}/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @PathVariable Long entryId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        paidAdService.deleteEntry(entryId, campaignId, projectId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/campaigns/{campaignId}/stats")
    public ResponseEntity<PaidAdStatsResponse> getStats(
            @PathVariable Long projectId,
            @PathVariable Long campaignId,
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(paidAdService.getStats(campaignId, projectId, userDetails.getUserId(), days));
    }

    // ── Segment card ──────────────────────────────────────────────────────────

    @GetMapping("/total-spend")
    public ResponseEntity<Map<String, Long>> getTotalSpend(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        long cents = paidAdService.getTotalSpend(projectId, userDetails.getUserId());
        return ResponseEntity.ok(Map.of("totalSpendCents", cents));
    }
}
