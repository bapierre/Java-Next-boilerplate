package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreateCampaignRequest;
import com.javanextboilerplate.dto.response.CampaignResponse;
import com.javanextboilerplate.dto.response.CampaignStatsResponse;
import com.javanextboilerplate.entity.AffiliateCampaign;
import com.javanextboilerplate.entity.AffiliateClickDaily;
import com.javanextboilerplate.repository.AffiliateCampaignRepository;
import com.javanextboilerplate.repository.AffiliateClickDailyRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AffiliateCampaignService {

    private static final Set<String> BOT_UA_FRAGMENTS = Set.of(
            "bot", "crawler", "spider", "curl", "wget", "python", "go-http"
    );

    private final AffiliateCampaignRepository campaignRepository;
    private final AffiliateClickDailyRepository clickDailyRepository;
    private final SaasProjectRepository projectRepository;
    private final UserService userService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CampaignResponse> getCampaigns(Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        List<AffiliateCampaign> campaigns = campaignRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return campaigns.stream()
                .map(c -> CampaignResponse.from(c, sumClicks(c.getId())))
                .toList();
    }

    @Transactional
    public CampaignResponse createCampaign(Long projectId, CreateCampaignRequest req, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        String slug = generateSlug();
        AffiliateCampaign campaign = AffiliateCampaign.builder()
                .projectId(projectId)
                .name(req.getName().strip())
                .destinationUrl(normalizeUrl(req.getDestinationUrl().strip()))
                .slug(slug)
                .build();
        AffiliateCampaign saved = campaignRepository.save(campaign);
        return CampaignResponse.from(saved, 0L);
    }

    @Transactional
    public void deleteCampaign(Long campaignId, Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        AffiliateCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        if (!campaign.getProjectId().equals(projectId)) {
            throw new RuntimeException("Campaign not found");
        }
        campaignRepository.delete(campaign);
    }

    @Transactional(readOnly = true)
    public CampaignStatsResponse getStats(Long campaignId, Long projectId, String supabaseUserId, int days) {
        assertOwnership(projectId, supabaseUserId);
        AffiliateCampaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        if (!campaign.getProjectId().equals(projectId)) {
            throw new RuntimeException("Campaign not found");
        }

        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusDays(days - 1L);

        List<AffiliateClickDaily> rows = clickDailyRepository
                .findByCampaignIdAndDateBetweenOrderByDateAsc(campaignId, from, to);

        List<CampaignStatsResponse.DailyClickPoint> timeline = rows.stream()
                .map(r -> CampaignStatsResponse.DailyClickPoint.builder()
                        .date(r.getDate())
                        .totalClicks(r.getTotalClicks())
                        .uniqueClicks(r.getUniqueClicks())
                        .build())
                .toList();

        Map<String, Integer> byReferer = new HashMap<>();
        Map<String, Integer> byDevice  = new HashMap<>();
        int totalClicks  = 0;
        int uniqueClicks = 0;

        for (AffiliateClickDaily row : rows) {
            totalClicks  += row.getTotalClicks();
            uniqueClicks += row.getUniqueClicks();
            row.getByReferer().forEach((k, v) -> byReferer.merge(k, v, Integer::sum));
            row.getByDevice().forEach((k, v)  -> byDevice.merge(k, v, Integer::sum));
        }

        return CampaignStatsResponse.builder()
                .timeline(timeline)
                .byReferer(byReferer)
                .byDevice(byDevice)
                .totalClicks(totalClicks)
                .uniqueClicks(uniqueClicks)
                .build();
    }

    // ── Click recording ───────────────────────────────────────────────────────

    /**
     * Records a click for the campaign with the given slug.
     * Never throws — click recording failure must not block the visitor redirect.
     */
    @Transactional
    public void recordClick(Long campaignId, String userAgent, String referer, boolean isUnique) {
        // Bot filter — skip recording silently
        if (isBot(userAgent)) {
            log.debug("Bot click skipped for campaignId={}", campaignId);
            return;
        }

        String platform = parseReferer(referer);
        String device   = parseDevice(userAgent);
        LocalDate today = LocalDate.now();

        // Native PostgreSQL UPSERT — avoids JPA merge/persist issues with composite PKs
        clickDailyRepository.upsertClick(
                campaignId, today,
                1, isUnique ? 1 : 0,
                platform, device
        );

        log.info("Click recorded: campaignId={} referer={} device={} unique={}", campaignId, platform, device, isUnique);
    }

    /**
     * Looks up campaign by slug, returning both destination URL and campaign ID.
     * Used by the tracking controller to redirect first, record second.
     *
     * @return the campaign, or empty if not found/inactive
     */
    @Transactional(readOnly = true)
    public java.util.Optional<AffiliateCampaign> findActiveCampaign(String slug) {
        return campaignRepository.findBySlug(slug)
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertOwnership(Long projectId, String supabaseUserId) {
        var user = userService.getUserBySupabaseId(supabaseUserId);
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private long sumClicks(Long campaignId) {
        return clickDailyRepository.findByCampaignIdOrderByDateAsc(campaignId)
                .stream().mapToLong(AffiliateClickDaily::getTotalClicks).sum();
    }

    private String normalizeUrl(String url) {
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return "https://" + url;
        }
        return url;
    }

    private String generateSlug() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private boolean isBot(String ua) {
        if (ua == null || ua.isBlank()) return true;
        String lower = ua.toLowerCase();
        return BOT_UA_FRAGMENTS.stream().anyMatch(lower::contains);
    }

    private String parseReferer(String referer) {
        if (referer == null || referer.isBlank()) return "Direct";
        String r = referer.toLowerCase();
        if (r.contains("youtube.com") || r.contains("youtu.be")) return "YouTube";
        if (r.contains("t.co") || r.contains("twitter.com") || r.contains("x.com")) return "Twitter/X";
        if (r.contains("instagram.com")) return "Instagram";
        if (r.contains("reddit.com")) return "Reddit";
        if (r.contains("linkedin.com")) return "LinkedIn";
        if (r.contains("tiktok.com")) return "TikTok";
        return "Other";
    }

    private String parseDevice(String ua) {
        if (ua == null) return "Desktop";
        if (ua.contains("iPad") || (ua.contains("Android") && ua.contains("Tablet"))) return "Tablet";
        if (ua.contains("Mobile") || (ua.contains("Android") && !ua.contains("Tablet"))) return "Mobile";
        return "Desktop";
    }
}
