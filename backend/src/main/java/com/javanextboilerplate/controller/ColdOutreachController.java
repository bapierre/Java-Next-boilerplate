package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreateColdOutreachRequest;
import com.javanextboilerplate.dto.request.CreateOutreachTemplateRequest;
import com.javanextboilerplate.dto.request.UpdateOutreachStatusRequest;
import com.javanextboilerplate.dto.response.ColdOutreachResponse;
import com.javanextboilerplate.dto.response.OutreachTemplateResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.ColdOutreachService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/outreach")
@RequiredArgsConstructor
public class ColdOutreachController {

    private final ColdOutreachService outreachService;

    // ── Outreach entries ─────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<ColdOutreachResponse>> list(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(outreachService.getOutreaches(projectId, userDetails.getUserId()));
    }

    @PostMapping
    public ResponseEntity<ColdOutreachResponse> create(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateColdOutreachRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        ColdOutreachResponse response = outreachService.createOutreach(projectId, userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{outreachId}/status")
    public ResponseEntity<ColdOutreachResponse> updateStatus(
            @PathVariable Long projectId,
            @PathVariable Long outreachId,
            @Valid @RequestBody UpdateOutreachStatusRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                outreachService.updateStatus(projectId, outreachId, userDetails.getUserId(), request));
    }

    @DeleteMapping("/{outreachId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long projectId,
            @PathVariable Long outreachId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        outreachService.deleteOutreach(projectId, outreachId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    @GetMapping("/templates")
    public ResponseEntity<List<OutreachTemplateResponse>> listTemplates(
            @PathVariable Long projectId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(outreachService.getTemplates(projectId, userDetails.getUserId()));
    }

    @PostMapping("/templates")
    public ResponseEntity<OutreachTemplateResponse> createTemplate(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateOutreachTemplateRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        OutreachTemplateResponse response =
                outreachService.createTemplate(projectId, userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/templates/{templateId}")
    public ResponseEntity<OutreachTemplateResponse> updateTemplate(
            @PathVariable Long projectId,
            @PathVariable Long templateId,
            @Valid @RequestBody CreateOutreachTemplateRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        return ResponseEntity.ok(
                outreachService.updateTemplate(projectId, templateId, userDetails.getUserId(), request));
    }

    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long projectId,
            @PathVariable Long templateId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        outreachService.deleteTemplate(projectId, templateId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
