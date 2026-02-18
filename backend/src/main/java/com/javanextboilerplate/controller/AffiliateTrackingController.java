package com.javanextboilerplate.controller;

import com.javanextboilerplate.service.AffiliateCampaignService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
public class AffiliateTrackingController {

    private static final String COOKIE_PREFIX  = "mst_";
    private static final int    COOKIE_MAX_AGE = 60 * 60 * 24; // 24 h

    private final AffiliateCampaignService affiliateService;

    @GetMapping("/t/{slug}")
    public void track(
            @PathVariable String slug,
            HttpServletRequest req,
            HttpServletResponse res
    ) throws IOException {
        // Step 1: Look up the campaign — 404 only if slug doesn't exist or is inactive
        var campaignOpt = affiliateService.findActiveCampaign(slug);
        if (campaignOpt.isEmpty()) {
            log.warn("Unknown or inactive slug={}", slug);
            res.setStatus(HttpServletResponse.SC_NOT_FOUND);
            res.setContentType("text/plain");
            res.getWriter().write("Not Found");
            return;
        }

        var campaign = campaignOpt.get();
        String destination = campaign.getDestinationUrl();

        // Step 2: Set unique-visit cookie
        String cookieName = COOKIE_PREFIX + slug;
        boolean isUnique  = isFreshVisit(req, cookieName);
        if (isUnique) {
            // SameSite=Lax — works for top-level navigations (i.e. clicking affiliate links)
            res.addHeader("Set-Cookie",
                    cookieName + "=1; Max-Age=" + COOKIE_MAX_AGE + "; Path=/; HttpOnly; SameSite=Lax");
        }

        // Step 3: Record the click — NEVER blocks the redirect
        try {
            affiliateService.recordClick(
                    campaign.getId(),
                    req.getHeader("User-Agent"),
                    req.getHeader("Referer"),
                    isUnique
            );
        } catch (Exception e) {
            log.warn("Click recording failed for slug={}: {} — {}", slug, e.getClass().getSimpleName(), e.getMessage(), e);
        }

        // Step 4: Redirect — unconditional
        log.info("Redirecting slug={} -> {}", slug, destination);
        res.sendRedirect(destination);
    }

    private boolean isFreshVisit(HttpServletRequest req, String cookieName) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return true;
        for (Cookie c : cookies) {
            if (cookieName.equals(c.getName())) return false;
        }
        return true;
    }
}
