package com.javanextboilerplate.security;

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
import java.util.Base64;
import java.util.TreeMap;

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

        // First, try the non-chunked cookie (pattern: sb-*-auth-token)
        String directValue = Arrays.stream(cookies)
                .filter(cookie -> {
                    String name = cookie.getName();
                    return name.startsWith("sb-") && name.endsWith("-auth-token");
                })
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (directValue != null) {
            return parseAccessToken(directValue);
        }

        // Supabase SSR chunks large cookies: sb-*-auth-token.0, sb-*-auth-token.1, ...
        // Collect all chunks sorted by index and reassemble
        TreeMap<Integer, String> chunks = new TreeMap<>();
        String baseName = null;
        for (Cookie cookie : cookies) {
            String name = cookie.getName();
            // Match pattern: sb-{ref}-auth-token.{N}
            int dotIdx = name.lastIndexOf('.');
            if (dotIdx > 0 && name.startsWith("sb-") && name.substring(0, dotIdx).endsWith("-auth-token")) {
                try {
                    int index = Integer.parseInt(name.substring(dotIdx + 1));
                    chunks.put(index, cookie.getValue());
                    if (baseName == null) {
                        baseName = name.substring(0, dotIdx);
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }

        if (!chunks.isEmpty()) {
            StringBuilder reassembled = new StringBuilder();
            for (String chunk : chunks.values()) {
                reassembled.append(chunk);
            }
            log.debug("Reassembled {} chunked cookies for {}", chunks.size(), baseName);
            return parseAccessToken(reassembled.toString());
        }

        return null;
    }

    private String parseAccessToken(String cookieValue) {
        try {
            String decoded = URLDecoder.decode(cookieValue, StandardCharsets.UTF_8);

            // Supabase SSR base64-encodes cookie values with a "base64-" prefix
            if (decoded.startsWith("base64-")) {
                decoded = new String(
                        Base64.getDecoder().decode(decoded.substring("base64-".length())),
                        StandardCharsets.UTF_8);
            }

            JsonNode node = objectMapper.readTree(decoded);
            JsonNode accessToken = node.get("access_token");
            if (accessToken != null && !accessToken.isNull()) {
                return accessToken.asText();
            }
        } catch (Exception e) {
            log.error("Failed to extract access_token from cookie: {}", e.getMessage());
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Don't filter CORS preflight or webhook endpoints
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.startsWith("/api/webhooks/");
    }
}
