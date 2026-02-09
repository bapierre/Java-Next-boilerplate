package com.javanextboilerplate.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;

@Component
@Slf4j
public class WebhookSignatureValidator {

    private static final long MAX_TIMESTAMP_AGE_SECONDS = 300; // 5 minutes

    public boolean validateMailgunSignature(String timestamp, String token, String signature, String signingKey) {
        try {
            // Reject replayed webhooks older than 5 minutes
            long webhookTime = Long.parseLong(timestamp);
            long now = Instant.now().getEpochSecond();
            if (Math.abs(now - webhookTime) > MAX_TIMESTAMP_AGE_SECONDS) {
                log.error("Mailgun webhook timestamp too old: {} (now: {})", webhookTime, now);
                return false;
            }

            String data = timestamp + token;
            String expectedSignature = computeHmacSha256(data, signingKey);

            // Timing-safe comparison to prevent timing attacks
            return MessageDigest.isEqual(
                    expectedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (NumberFormatException e) {
            log.error("Invalid Mailgun webhook timestamp: {}", timestamp);
            return false;
        } catch (Exception e) {
            log.error("Error validating Mailgun signature: {}", e.getMessage());
            return false;
        }
    }

    private String computeHmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC SHA256", e);
        }
    }
}
