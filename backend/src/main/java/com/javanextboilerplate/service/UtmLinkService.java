package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreateUtmLinkRequest;
import com.javanextboilerplate.dto.response.UtmLinkResponse;
import com.javanextboilerplate.entity.UtmLink;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.repository.UtmClickDailyRepository;
import com.javanextboilerplate.repository.UtmLinkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UtmLinkService {

    private static final Set<String> BOT_UA_FRAGMENTS = Set.of(
            "bot", "crawler", "spider", "curl", "wget", "python", "go-http"
    );

    private final UtmLinkRepository linkRepository;
    private final UtmClickDailyRepository clickDailyRepository;
    private final SaasProjectRepository projectRepository;
    private final UserService userService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UtmLinkResponse> getLinks(Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        return linkRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
                .map(l -> UtmLinkResponse.from(l, sumClicks(l.getId())))
                .toList();
    }

    @Transactional
    public UtmLinkResponse createLink(Long projectId, CreateUtmLinkRequest req, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        String slug = generateSlug();
        UtmLink link = UtmLink.builder()
                .projectId(projectId)
                .name(req.getName().strip())
                .destinationUrl(normalizeUrl(req.getDestinationUrl().strip()))
                .utmSource(req.getUtmSource().strip())
                .utmMedium(req.getUtmMedium().strip())
                .utmCampaign(req.getUtmCampaign().strip())
                .utmContent(req.getUtmContent() != null ? req.getUtmContent().strip() : null)
                .utmTerm(req.getUtmTerm() != null ? req.getUtmTerm().strip() : null)
                .slug(slug)
                .build();
        UtmLink saved = linkRepository.save(link);
        return UtmLinkResponse.from(saved, 0L);
    }

    @Transactional
    public void deleteLink(Long linkId, Long projectId, String supabaseUserId) {
        assertOwnership(projectId, supabaseUserId);
        UtmLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new RuntimeException("UTM link not found"));
        if (!link.getProjectId().equals(projectId)) {
            throw new RuntimeException("UTM link not found");
        }
        linkRepository.delete(link);
    }

    // ── Tracking ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Optional<UtmLink> findActiveLink(String slug) {
        return linkRepository.findBySlug(slug)
                .filter(l -> Boolean.TRUE.equals(l.getIsActive()));
    }

    @Transactional
    public void recordClick(Long utmLinkId, String userAgent, String referer, boolean isUnique) {
        if (isBot(userAgent)) {
            log.debug("Bot click skipped for utmLinkId={}", utmLinkId);
            return;
        }
        String platform = parseReferer(referer);
        String device   = parseDevice(userAgent);
        LocalDate today = LocalDate.now();

        clickDailyRepository.upsertClick(
                utmLinkId, today,
                1, isUnique ? 1 : 0,
                platform, device
        );
        log.info("UTM click recorded: utmLinkId={} referer={} device={} unique={}", utmLinkId, platform, device, isUnique);
    }

    public String buildUtmUrl(UtmLink link) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(link.getDestinationUrl())
                .queryParam("utm_source",   link.getUtmSource())
                .queryParam("utm_medium",   link.getUtmMedium())
                .queryParam("utm_campaign", link.getUtmCampaign());
        if (link.getUtmContent() != null && !link.getUtmContent().isBlank()) {
            builder.queryParam("utm_content", link.getUtmContent());
        }
        if (link.getUtmTerm() != null && !link.getUtmTerm().isBlank()) {
            builder.queryParam("utm_term", link.getUtmTerm());
        }
        return builder.build().toUriString();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertOwnership(Long projectId, String supabaseUserId) {
        var user = userService.getUserBySupabaseId(supabaseUserId);
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private long sumClicks(Long utmLinkId) {
        return clickDailyRepository.findByUtmLinkIdOrderByDateAsc(utmLinkId)
                .stream().mapToLong(d -> d.getTotalClicks()).sum();
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
        if (r.contains("google.com")) return "Google";
        return "Other";
    }

    private String parseDevice(String ua) {
        if (ua == null) return "Desktop";
        if (ua.contains("iPad") || (ua.contains("Android") && ua.contains("Tablet"))) return "Tablet";
        if (ua.contains("Mobile") || (ua.contains("Android") && !ua.contains("Tablet"))) return "Mobile";
        return "Desktop";
    }
}
