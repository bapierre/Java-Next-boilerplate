package com.marketistats.controller;

import com.marketistats.security.WebhookSignatureValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/mailgun")
@RequiredArgsConstructor
@Slf4j
public class MailgunWebhookController {

    private final WebhookSignatureValidator signatureValidator;

    @Value("${mailgun.signing-key}")
    private String signingKey;

    @Value("${mailgun.forward-replies-to}")
    private String forwardTo;

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> handleWebhook(
            @RequestParam("timestamp") String timestamp,
            @RequestParam("token") String token,
            @RequestParam("signature") String signature,
            @RequestParam(value = "sender", required = false) String sender,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "body-plain", required = false) String bodyPlain
    ) {
        // Validate signature
        if (!signatureValidator.validateMailgunSignature(timestamp, token, signature, signingKey)) {
            log.error("Mailgun webhook signature verification failed");
            return ResponseEntity.badRequest().body(Map.of("received", false));
        }

        log.info("Received Mailgun webhook - Sender: {}, Subject: {}", sender, subject);

        try {
            // TODO: Implement email forwarding logic
            log.info("Email received from: {}, Subject: {}", sender, subject);
            log.debug("Body: {}", bodyPlain);
        } catch (Exception e) {
            log.error("Error processing Mailgun webhook: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("received", false));
        }

        return ResponseEntity.ok(Map.of("received", true));
    }
}
