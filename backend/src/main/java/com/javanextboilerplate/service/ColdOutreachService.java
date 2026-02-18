package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreateColdOutreachRequest;
import com.javanextboilerplate.dto.request.CreateOutreachTemplateRequest;
import com.javanextboilerplate.dto.request.UpdateOutreachStatusRequest;
import com.javanextboilerplate.dto.response.ColdOutreachResponse;
import com.javanextboilerplate.dto.response.OutreachTemplateResponse;
import com.javanextboilerplate.entity.ColdOutreach;
import com.javanextboilerplate.entity.OutreachTemplate;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ColdOutreachRepository;
import com.javanextboilerplate.repository.OutreachTemplateRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ColdOutreachService {

    private final ColdOutreachRepository outreachRepository;
    private final OutreachTemplateRepository templateRepository;
    private final SaasProjectRepository projectRepository;
    private final UserService userService;

    // ── Outreach entries ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ColdOutreachResponse> getOutreaches(Long projectId, String supabaseUserId) {
        verifyOwnership(projectId, supabaseUserId);
        return outreachRepository.findByProjectIdOrderByContactedAtDesc(projectId, PageRequest.of(0, 1_000)).stream()
                .map(ColdOutreachResponse::from)
                .toList();
    }

    @Transactional
    public ColdOutreachResponse createOutreach(Long projectId, String supabaseUserId,
                                               CreateColdOutreachRequest request) {
        verifyOwnership(projectId, supabaseUserId);

        String platform = request.getPlatform().toUpperCase();
        String handle   = request.getHandle().trim();

        if (outreachRepository.existsByProjectIdAndPlatformIgnoreCaseAndHandleIgnoreCase(
                projectId, platform, handle)) {
            throw new IllegalArgumentException(
                    "You already have an outreach entry for @" + handle + " on " + platform);
        }

        String type = (request.getType() != null && !request.getType().isBlank())
                ? request.getType().toUpperCase()
                : "COLD";

        ColdOutreach outreach = ColdOutreach.builder()
                .projectId(projectId)
                .platform(platform)
                .handle(handle)
                .profileUrl(request.getProfileUrl())
                .templateId(request.getTemplateId())
                .messageSent(request.getMessageSent())
                .notes(request.getNotes())
                .status("ONGOING")
                .type(type)
                .build();

        ColdOutreach saved = outreachRepository.save(outreach);
        log.info("Created outreach for @{} on {} in project {}", handle, platform, projectId);
        return ColdOutreachResponse.from(saved);
    }

    @Transactional
    public ColdOutreachResponse updateStatus(Long projectId, Long outreachId,
                                             String supabaseUserId, UpdateOutreachStatusRequest request) {
        verifyOwnership(projectId, supabaseUserId);

        ColdOutreach outreach = outreachRepository.findByIdAndProjectId(outreachId, projectId)
                .orElseThrow(() -> new RuntimeException("Outreach not found"));

        outreach.setStatus(request.getStatus());
        if (request.getNotes() != null) {
            outreach.setNotes(request.getNotes());
        }

        ColdOutreach saved = outreachRepository.save(outreach);
        log.info("Outreach {} status updated to {} in project {}", outreachId, request.getStatus(), projectId);
        return ColdOutreachResponse.from(saved);
    }

    @Transactional
    public void deleteOutreach(Long projectId, Long outreachId, String supabaseUserId) {
        verifyOwnership(projectId, supabaseUserId);
        ColdOutreach outreach = outreachRepository.findByIdAndProjectId(outreachId, projectId)
                .orElseThrow(() -> new RuntimeException("Outreach not found"));
        outreachRepository.delete(outreach);
        log.info("Deleted outreach {} from project {}", outreachId, projectId);
    }

    // ── Templates ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OutreachTemplateResponse> getTemplates(Long projectId, String supabaseUserId) {
        verifyOwnership(projectId, supabaseUserId);
        return templateRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(OutreachTemplateResponse::from)
                .toList();
    }

    @Transactional
    public OutreachTemplateResponse createTemplate(Long projectId, String supabaseUserId,
                                                   CreateOutreachTemplateRequest request) {
        verifyOwnership(projectId, supabaseUserId);

        OutreachTemplate template = OutreachTemplate.builder()
                .projectId(projectId)
                .name(request.getName())
                .content(request.getContent())
                .build();

        OutreachTemplate saved = templateRepository.save(template);
        log.info("Created outreach template '{}' for project {}", request.getName(), projectId);
        return OutreachTemplateResponse.from(saved);
    }

    @Transactional
    public OutreachTemplateResponse updateTemplate(Long projectId, Long templateId,
                                                   String supabaseUserId, CreateOutreachTemplateRequest request) {
        verifyOwnership(projectId, supabaseUserId);
        OutreachTemplate template = templateRepository.findByIdAndProjectId(templateId, projectId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        template.setName(request.getName());
        template.setContent(request.getContent());
        OutreachTemplate saved = templateRepository.save(template);
        log.info("Updated outreach template '{}' (id={}) for project {}", request.getName(), templateId, projectId);
        return OutreachTemplateResponse.from(saved);
    }

    @Transactional
    public void deleteTemplate(Long projectId, Long templateId, String supabaseUserId) {
        verifyOwnership(projectId, supabaseUserId);
        OutreachTemplate template = templateRepository.findByIdAndProjectId(templateId, projectId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
        templateRepository.delete(template);
        log.info("Deleted outreach template {} from project {}", templateId, projectId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void verifyOwnership(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }
}
