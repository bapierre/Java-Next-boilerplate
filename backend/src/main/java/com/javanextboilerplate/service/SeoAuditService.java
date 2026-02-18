package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.response.SeoAuditResponse;
import com.javanextboilerplate.dto.response.SeoCheckItem;
import com.javanextboilerplate.entity.SeoAudit;
import com.javanextboilerplate.repository.SeoAuditRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeoAuditService {

    private static final int TIMEOUT_MS        = 12_000;
    private static final int MAX_BODY_BYTES    = 2 * 1024 * 1024;
    /** Minimum minutes between audits per project. */
    static final int RATE_LIMIT_MINUTES        = 15;

    private final SeoAuditRepository   auditRepository;
    private final SaasProjectRepository projectRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Optional<SeoAuditResponse> getLatest(Long projectId) {
        return auditRepository.findTopByProjectIdOrderByAuditedAtDesc(projectId)
                .map(SeoAuditResponse::from);
    }

    /**
     * Runs a fresh audit using the project's websiteUrl, persists it, and returns it.
     *
     * @throws IllegalStateException if the project has no websiteUrl set
     * @throws RateLimitException    if an audit was run less than RATE_LIMIT_MINUTES ago
     * @throws RuntimeException      if the URL cannot be fetched
     */
    @Transactional
    public SeoAuditResponse runAudit(Long projectId) throws Exception {
        // 1. Resolve project website URL
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        String rawUrl = project.getWebsiteUrl();
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new IllegalStateException("No website URL set for this project. Please add one in the project settings.");
        }

        // 2. Rate-limit check
        auditRepository.findTopByProjectIdOrderByAuditedAtDesc(projectId).ifPresent(latest -> {
            LocalDateTime cooldownEnds = latest.getAuditedAt().plusMinutes(RATE_LIMIT_MINUTES);
            if (LocalDateTime.now().isBefore(cooldownEnds)) {
                long secondsLeft = java.time.Duration.between(LocalDateTime.now(), cooldownEnds).getSeconds();
                throw new RateLimitException(secondsLeft);
            }
        });

        // 3. Fetch and parse
        String url = normalizeUrl(rawUrl);
        validateUrl(url);

        Document doc;
        try {
            doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (compatible; MarketiStats-SEO/1.0)")
                    .timeout(TIMEOUT_MS)
                    .followRedirects(true)
                    .maxBodySize(MAX_BODY_BYTES)
                    .get();
        } catch (Exception e) {
            log.warn("SEO audit fetch failed for {}: {}", url, e.getMessage());
            throw new RuntimeException("Could not fetch the URL. Make sure it is publicly accessible: " + e.getMessage());
        }

        // 4. Run checks
        List<SeoCheckItem> checks = new ArrayList<>();
        checks.add(checkTitle(doc));
        checks.add(checkMetaDescription(doc));
        checks.addAll(checkHeadings(doc));
        checks.add(checkWordCount(doc));
        checks.add(checkImages(doc));
        checks.add(checkHttps(url));
        checks.add(checkCanonical(doc));
        checks.add(checkRobotsMeta(doc));
        checks.add(checkLang(doc));
        checks.add(checkUrlLength(url));
        checks.addAll(checkOpenGraph(doc));
        checks.add(checkTwitterCard(doc));
        checks.add(checkJsonLd(doc));

        // 5. Score
        long pass     = checks.stream().filter(c -> "PASS".equals(c.getStatus())).count();
        long warn     = checks.stream().filter(c -> "WARN".equals(c.getStatus())).count();
        long fail     = checks.stream().filter(c -> "FAIL".equals(c.getStatus())).count();
        long scoreable = pass + warn + fail;
        int score = scoreable > 0 ? (int) Math.round((pass + warn * 0.5) / (double) scoreable * 100) : 0;

        // 6. Persist
        SeoAudit saved = auditRepository.save(SeoAudit.builder()
                .projectId(projectId)
                .url(url)
                .score(score)
                .passCount((int) pass)
                .warnCount((int) warn)
                .failCount((int) fail)
                .checks(checks)
                .build());

        log.info("SEO audit for project {} completed: score={}", projectId, score);
        return SeoAuditResponse.from(saved);
    }

    // ── Rate-limit exception ──────────────────────────────────────────────────

    public static class RateLimitException extends RuntimeException {
        private final long secondsLeft;
        public RateLimitException(long secondsLeft) {
            super("Rate limit exceeded");
            this.secondsLeft = secondsLeft;
        }
        public long getSecondsLeft() { return secondsLeft; }
    }

    // ── URL helpers ───────────────────────────────────────────────────────────

    private String normalizeUrl(String url) {
        url = url.strip();
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        return url;
    }

    private void validateUrl(String url) throws Exception {
        URI uri = URI.create(url);
        String proto = uri.getScheme();
        if (!"http".equals(proto) && !"https".equals(proto)) {
            throw new IllegalArgumentException("Only HTTP/HTTPS URLs are allowed");
        }
        InetAddress addr = InetAddress.getByName(uri.getHost());
        if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress()) {
            throw new IllegalArgumentException("Private/local addresses are not allowed");
        }
    }

    // ── Content checks ────────────────────────────────────────────────────────

    private SeoCheckItem checkTitle(Document doc) {
        String title = doc.title().strip();
        if (title.isEmpty()) return item("title", "Content", "Page Title", "FAIL",
                "No <title> tag found",
                "Add a descriptive title of 50-60 characters containing your primary keyword");
        int len = title.length();
        if (len < 30) return item("title", "Content", "Page Title", "WARN",
                "Title is very short (" + len + " chars): \"" + cut(title, 70) + "\"",
                "Expand your title to 50-60 characters to improve click-through rates");
        if (len > 60) return item("title", "Content", "Page Title", "WARN",
                "Title is too long (" + len + " chars): \"" + cut(title, 70) + "\"",
                "Shorten to 60 characters or fewer to prevent truncation in search results");
        return item("title", "Content", "Page Title", "PASS",
                "\"" + cut(title, 70) + "\" (" + len + " chars)", null);
    }

    private SeoCheckItem checkMetaDescription(Document doc) {
        String desc = doc.select("meta[name=description]").attr("content").strip();
        if (desc.isEmpty()) return item("meta_description", "Content", "Meta Description", "FAIL",
                "No meta description found",
                "Add a meta description of 120-160 characters summarising the page for search snippets");
        int len = desc.length();
        if (len < 80) return item("meta_description", "Content", "Meta Description", "WARN",
                "Description is too short (" + len + " chars): \"" + cut(desc, 80) + "\"",
                "Expand to 120-160 characters for a more informative search snippet");
        if (len > 160) return item("meta_description", "Content", "Meta Description", "WARN",
                "Description is " + len + " chars — will be truncated in search results",
                "Keep it under 160 characters");
        return item("meta_description", "Content", "Meta Description", "PASS",
                "\"" + cut(desc, 80) + "\" (" + len + " chars)", null);
    }

    private List<SeoCheckItem> checkHeadings(Document doc) {
        List<SeoCheckItem> result = new ArrayList<>();
        Elements h1s = doc.select("h1");
        if (h1s.isEmpty()) {
            result.add(item("h1", "Content", "H1 Heading", "FAIL", "No H1 tag found",
                    "Add exactly one H1 tag with your primary keyword"));
        } else if (h1s.size() > 1) {
            result.add(item("h1", "Content", "H1 Heading", "WARN",
                    h1s.size() + " H1 tags found",
                    "Use only one H1 per page to clearly signal the main topic"));
        } else {
            result.add(item("h1", "Content", "H1 Heading", "PASS",
                    "\"" + cut(h1s.first().text(), 70) + "\"", null));
        }
        Elements h2s = doc.select("h2");
        if (h2s.isEmpty()) {
            result.add(item("h2", "Content", "H2 Subheadings", "WARN", "No H2 tags found",
                    "Use H2 subheadings to break up content and target secondary keywords"));
        } else {
            result.add(item("h2", "Content", "H2 Subheadings", "PASS",
                    h2s.size() + " H2 tag" + (h2s.size() > 1 ? "s" : "") + " found", null));
        }
        return result;
    }

    private SeoCheckItem checkWordCount(Document doc) {
        String text = doc.body() != null ? doc.body().text() : "";
        int words = text.isBlank() ? 0 : text.split("\\s+").length;
        if (words < 150) return item("word_count", "Content", "Word Count", "FAIL",
                words + " words — very thin content",
                "Aim for at least 300 words; thin pages rarely rank well");
        if (words < 300) return item("word_count", "Content", "Word Count", "WARN",
                words + " words — content is thin",
                "Consider expanding to 300+ words to compete for keyword rankings");
        return item("word_count", "Content", "Word Count", "PASS", words + " words", null);
    }

    private SeoCheckItem checkImages(Document doc) {
        Elements imgs = doc.select("img");
        if (imgs.isEmpty()) return item("images_alt", "Content", "Image Alt Texts", "INFO",
                "No images found on this page", null);
        long missing = imgs.stream().filter(i -> i.attr("alt").isBlank()).count();
        if (missing == 0) return item("images_alt", "Content", "Image Alt Texts", "PASS",
                "All " + imgs.size() + " images have alt attributes", null);
        String status = missing == imgs.size() ? "FAIL" : "WARN";
        return item("images_alt", "Content", "Image Alt Texts", status,
                missing + " of " + imgs.size() + " images are missing alt attributes",
                "Add descriptive alt text to every image for accessibility and image-search visibility");
    }

    // ── Technical checks ──────────────────────────────────────────────────────

    private SeoCheckItem checkHttps(String url) {
        boolean secure = url.startsWith("https://");
        return item("https", "Technical", "HTTPS", secure ? "PASS" : "FAIL",
                secure ? "Site is served over HTTPS" : "Site is not using HTTPS",
                secure ? null : "Migrate to HTTPS — Google uses it as a ranking signal");
    }

    private SeoCheckItem checkCanonical(Document doc) {
        String href = doc.select("link[rel=canonical]").attr("href").strip();
        if (href.isEmpty()) return item("canonical", "Technical", "Canonical Tag", "WARN",
                "No canonical tag found",
                "Add <link rel=\"canonical\" href=\"...\"> to prevent duplicate content issues");
        return item("canonical", "Technical", "Canonical Tag", "PASS", href, null);
    }

    private SeoCheckItem checkRobotsMeta(Document doc) {
        String robots = doc.select("meta[name=robots]").attr("content").toLowerCase().strip();
        if (robots.isEmpty()) return item("robots", "Technical", "Robots Meta", "INFO",
                "No robots meta tag — defaults to index, follow", null);
        if (robots.contains("noindex")) return item("robots", "Technical", "Robots Meta", "FAIL",
                "Page is set to noindex — search engines will not index it",
                "Remove the noindex directive unless intentional");
        return item("robots", "Technical", "Robots Meta", "PASS", "robots: " + robots, null);
    }

    private SeoCheckItem checkLang(Document doc) {
        String lang = doc.select("html").attr("lang").strip();
        if (lang.isEmpty()) return item("lang", "Technical", "Language Attribute", "WARN",
                "No lang attribute on <html>",
                "Add lang=\"en\" (or your language code) to <html>");
        return item("lang", "Technical", "Language Attribute", "PASS", "lang=\"" + lang + "\"", null);
    }

    private SeoCheckItem checkUrlLength(String url) {
        int len = url.length();
        if (len > 100) return item("url_length", "Technical", "URL Length", "FAIL",
                "URL is " + len + " characters (ideal: under 75)",
                "Use short, hyphen-separated URLs");
        if (len > 75) return item("url_length", "Technical", "URL Length", "WARN",
                "URL is " + len + " characters (ideal: under 75)",
                "Consider shortening the URL for better readability");
        return item("url_length", "Technical", "URL Length", "PASS", len + " characters", null);
    }

    // ── Social / OG checks ────────────────────────────────────────────────────

    private List<SeoCheckItem> checkOpenGraph(Document doc) {
        List<SeoCheckItem> result = new ArrayList<>();
        String ogTitle = doc.select("meta[property=og:title]").attr("content").strip();
        result.add(ogTitle.isEmpty()
                ? item("og_title", "Social", "OG Title", "WARN", "og:title not set",
                "Add <meta property=\"og:title\"> for better social sharing appearance")
                : item("og_title", "Social", "OG Title", "PASS", "\"" + cut(ogTitle, 60) + "\"", null));
        String ogDesc = doc.select("meta[property=og:description]").attr("content").strip();
        result.add(ogDesc.isEmpty()
                ? item("og_description", "Social", "OG Description", "WARN", "og:description not set",
                "Add <meta property=\"og:description\"> for better social sharing")
                : item("og_description", "Social", "OG Description", "PASS", "\"" + cut(ogDesc, 60) + "\"", null));
        String ogImage = doc.select("meta[property=og:image]").attr("content").strip();
        result.add(ogImage.isEmpty()
                ? item("og_image", "Social", "OG Image", "WARN", "og:image not set",
                "Add <meta property=\"og:image\"> — posts with images get far more clicks")
                : item("og_image", "Social", "OG Image", "PASS", "Image URL set", null));
        return result;
    }

    private SeoCheckItem checkTwitterCard(Document doc) {
        String card = doc.select("meta[name=twitter:card]").attr("content").strip();
        if (card.isEmpty()) return item("twitter_card", "Social", "Twitter Card", "INFO",
                "twitter:card not set",
                "Add <meta name=\"twitter:card\" content=\"summary_large_image\"> for rich X/Twitter previews");
        return item("twitter_card", "Social", "Twitter Card", "PASS", "twitter:card=\"" + card + "\"", null);
    }

    // ── Structured data ───────────────────────────────────────────────────────

    private SeoCheckItem checkJsonLd(Document doc) {
        Elements scripts = doc.select("script[type=application/ld+json]");
        if (scripts.isEmpty()) return item("json_ld", "Structured Data", "JSON-LD Schema", "INFO",
                "No JSON-LD structured data found",
                "Add schema markup (e.g. Organization, Product, Article) to earn rich results in Google Search");
        return item("json_ld", "Structured Data", "JSON-LD Schema", "PASS",
                scripts.size() + " JSON-LD block" + (scripts.size() > 1 ? "s" : "") + " found", null);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SeoCheckItem item(String id, String category, String label,
                              String status, String detail, String recommendation) {
        return SeoCheckItem.builder()
                .id(id).category(category).label(label)
                .status(status).detail(detail).recommendation(recommendation)
                .build();
    }

    private String cut(String s, int max) {
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }
}
