package com.marketistats.security;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class SupabaseJwtAuthenticationFilter extends OncePerRequestFilter {

    private final SupabaseJwtValidator jwtValidator;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = extractTokenFromCookies(request);

            if (token != null) {
                DecodedJWT jwt = jwtValidator.validateToken(token);

                if (jwt != null) {
                    String userId = jwtValidator.getUserId(jwt);
                    String email = jwtValidator.getEmail(jwt);
                    String role = jwtValidator.getRole(jwt);

                    SupabaseUserDetails userDetails = new SupabaseUserDetails(userId, email, role != null ? role : "user");

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("Authenticated user: {} ({})", email, userId);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        // Look for Supabase auth token cookie (pattern: sb-*-auth-token)
        return Arrays.stream(cookies)
                .filter(cookie -> {
                    String name = cookie.getName();
                    return name.startsWith("sb-") && name.endsWith("-auth-token");
                })
                .findFirst()
                .map(cookie -> {
                    String value = cookie.getValue();
                    try {
                        String decoded = URLDecoder.decode(value, StandardCharsets.UTF_8);
                        JsonNode node = objectMapper.readTree(decoded);
                        JsonNode accessToken = node.get("access_token");
                        if (accessToken != null && !accessToken.isNull()) {
                            return accessToken.asText();
                        }
                    } catch (Exception e) {
                        log.error("Failed to extract access_token from cookie: {}", e.getMessage());
                    }
                    return null;
                })
                .orElse(null);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Don't filter webhook endpoints (they use their own signature verification)
        return path.startsWith("/api/webhooks/");
    }
}
