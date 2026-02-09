package com.marketistats.security;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.JwkProviderBuilder;
import com.auth0.jwk.Jwk;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class SupabaseJwtValidator {

    @Value("${supabase.url}")
    private String supabaseUrl;

    private JwkProvider jwkProvider;
    private final ConcurrentHashMap<String, JWTVerifier> verifierCache = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        try {
            String jwksUrl = supabaseUrl + "/auth/v1/jwks";
            jwkProvider = new JwkProviderBuilder(new URL(jwksUrl))
                    .cached(10, 24, TimeUnit.HOURS)
                    .rateLimited(10, 1, TimeUnit.MINUTES)
                    .build();
        } catch (Exception e) {
            log.error("Failed to initialize JWK provider: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWK provider", e);
        }
    }

    /**
     * Validates and returns the verified JWT. Returns null if validation fails.
     */
    public DecodedJWT validateToken(String token) {
        try {
            DecodedJWT unverified = JWT.decode(token);
            String keyId = unverified.getKeyId();

            if (keyId == null) {
                log.error("JWT does not have a key ID");
                return null;
            }

            JWTVerifier verifier = verifierCache.computeIfAbsent(keyId, kid -> {
                try {
                    Jwk jwk = jwkProvider.get(kid);
                    RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();
                    Algorithm algorithm = Algorithm.RSA256(publicKey, null);
                    return JWT.require(algorithm)
                            .withIssuer(supabaseUrl + "/auth/v1")
                            .withAudience("authenticated")
                            .build();
                } catch (Exception e) {
                    log.error("Failed to build verifier for key ID {}: {}", kid, e.getMessage());
                    return null;
                }
            });

            if (verifier == null) {
                verifierCache.remove(keyId);
                return null;
            }

            return verifier.verify(token);
        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return null;
        }
    }

    public String getUserId(DecodedJWT jwt) {
        return jwt.getSubject();
    }

    public String getEmail(DecodedJWT jwt) {
        return jwt.getClaim("email").asString();
    }

    public String getRole(DecodedJWT jwt) {
        return jwt.getClaim("role").asString();
    }
}
