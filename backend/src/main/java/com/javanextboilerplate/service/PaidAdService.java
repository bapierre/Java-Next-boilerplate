package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreatePaidAdCampaignRequest;
import com.javanextboilerplate.dto.request.CreatePaidAdEntryRequest;
import com.javanextboilerplate.dto.response.PaidAdCampaignResponse;
import com.javanextboilerplate.dto.response.PaidAdEntryResponse;
import com.javanextboilerplate.dto.response.PaidAdStatsResponse;
import com.javanextboilerplate.entity.PaidAdCampaign;
import com.javanextboilerplate.entity.PaidAdEntry;
import com.javanextboilerplate.repository.PaidAdCampaignRepository;
import com.javanextboilerplate.repository.PaidAdEntryRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.repository.UtmClickDailyRepository;
import com.javanextboilerplate.repository.UtmLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaidAdService {

    private final PaidAdCampaignRepository campaignRepository;
    private final PaidAdEntryRepository entryRepository;
    private final SaasProjectRepository projectRepository;
    private final UtmLinkRepository utmLinkRepository;
    private final UtmClickDailyRepository utmClickDailyRepository;
    private final UserService userService;

    // ── Campaigns ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaidAdCampaignResponse> getCampaigns(Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        return campaignRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(c -> PaidAdCampaignResponse.from(c, entryRepository.findByCampaignIdOrderByDateAsc(c.getId())))
                .toList();
    }

    @Transactional
    public PaidAdCampaignResponse createCampaign(Long projectId, CreatePaidAdCampaignRequest req, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        PaidAdCampaign campaign = PaidAdCampaign.builder()
                .projectId(projectId)
                .name(req.getName().strip())
                .platform(req.getPlatform().strip().toUpperCase())
                .build();
        PaidAdCampaign saved = campaignRepository.save(campaign);
        return PaidAdCampaignResponse.from(saved, List.of());
    }

    @Transactional
    public void deleteCampaign(Long campaignId, Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        PaidAdCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        if (!campaign.getProjectId().equals(projectId)) {
            throw new RuntimeException("Campaign not found");
        }
        campaignRepository.delete(campaign);
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PaidAdEntryResponse> getEntries(Long campaignId, Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        assertCampaignOwnership(campaignId, projectId);
        return entryRepository.findByCampaignIdOrderByDateAsc(campaignId).stream()
                .map(PaidAdEntryResponse::from)
                .toList();
    }

    @Transactional
    public PaidAdEntryResponse upsertEntry(Long campaignId, Long projectId, CreatePaidAdEntryRequest req, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        assertCampaignOwnership(campaignId, projectId);

        PaidAdEntry entry = entryRepository.findByCampaignIdAndDate(campaignId, req.getDate())
                .orElse(PaidAdEntry.builder().campaignId(campaignId).date(req.getDate()).build());

        entry.setSpendCents(req.getSpendCents());
        entry.setClicks(req.getClicks());
        entry.setImpressions(req.getImpressions());
        entry.setConversions(req.getConversions());
        entry.setNotes(req.getNotes());

        return PaidAdEntryResponse.from(entryRepository.save(entry));
    }

    @Transactional
    public void deleteEntry(Long entryId, Long campaignId, Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        assertCampaignOwnership(campaignId, projectId);
        PaidAdEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        if (!entry.getCampaignId().equals(campaignId)) {
            throw new RuntimeException("Entry not found");
        }
        entryRepository.delete(entry);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PaidAdStatsResponse getStats(Long campaignId, Long projectId, String supabaseUserId, int days) {
        assertOwnership(projectId, supabaseUserId);
        assertCampaignOwnership(campaignId, projectId);

        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusDays(days - 1L);

        List<PaidAdEntry> rows = entryRepository.findByCampaignIdAndDateBetweenOrderByDateAsc(campaignId, from, to);

        List<PaidAdStatsResponse.DailyAdPoint> timeline = rows.stream()
                .map(r -> PaidAdStatsResponse.DailyAdPoint.builder()
                        .date(r.getDate())
                        .spendCents(r.getSpendCents())
                        .clicks(r.getClicks())
                        .impressions(r.getImpressions())
                        .conversions(r.getConversions())
                        .build())
                .toList();

        int totalSpend       = rows.stream().mapToInt(PaidAdEntry::getSpendCents).sum();
        int totalClicks      = rows.stream().mapToInt(PaidAdEntry::getClicks).sum();
        int totalImpressions = rows.stream().mapToInt(PaidAdEntry::getImpressions).sum();
        int totalConversions = rows.stream().mapToInt(PaidAdEntry::getConversions).sum();

        double cpc = totalClicks > 0      ? (double) totalSpend / totalClicks      : 0.0;
        double cpa = totalConversions > 0 ? (double) totalSpend / totalConversions : 0.0;
        double ctr = totalImpressions > 0 ? (double) totalClicks / totalImpressions * 100.0 : 0.0;

        // Aggregate UTM click data for all UTM links linked to this campaign
        List<Long> utmLinkIds = utmLinkRepository.findByCampaignId(campaignId)
                .stream().map(l -> l.getId()).toList();
        long utmTotalClicks  = 0;
        long utmUniqueClicks = 0;
        if (!utmLinkIds.isEmpty()) {
            var utmRows = utmClickDailyRepository.findByUtmLinkIdInAndDateBetweenOrderByDateAsc(utmLinkIds, from, to);
            utmTotalClicks  = utmRows.stream().mapToLong(r -> r.getTotalClicks()).sum();
            utmUniqueClicks = utmRows.stream().mapToLong(r -> r.getUniqueClicks()).sum();
        }

        return PaidAdStatsResponse.builder()
                .timeline(timeline)
                .totalSpendCents(totalSpend)
                .totalClicks(totalClicks)
                .totalImpressions(totalImpressions)
                .totalConversions(totalConversions)
                .cpc(cpc)
                .cpa(cpa)
                .ctr(ctr)
                .utmTotalClicks(utmTotalClicks)
                .utmUniqueClicks(utmUniqueClicks)
                .build();
    }

    // ── Segment card ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public long getTotalSpend(Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        return entryRepository.sumSpendCentsByProjectId(projectId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertOwnership(Long projectId, String supabaseUserId) {
        var user = userService.getUserBySupabaseId(supabaseUserId);
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private void assertCampaignOwnership(Long campaignId, Long projectId) {
        PaidAdCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        if (!campaign.getProjectId().equals(projectId)) {
            throw new RuntimeException("Campaign not found");
        }
    }
}
