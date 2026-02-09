package com.marketistats.controller;

import com.marketistats.entity.User;
import com.marketistats.service.SubscriptionService;
import com.marketistats.service.UserService;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeWebhookController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<Map<String, Boolean>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature
    ) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, signature, webhookSecret);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("received", false));
        }

        log.info("Received Stripe webhook event: {}", event.getType());

        // Acknowledge immediately, process asynchronously
        processEventAsync(event);

        return ResponseEntity.ok(Map.of("received", true));
    }

    @Async
    public void processEventAsync(Event event) {
        try {
            switch (event.getType()) {
                case "customer.subscription.created":
                    handleSubscriptionCreated(event);
                    break;
                case "customer.subscription.updated":
                    handleSubscriptionUpdated(event);
                    break;
                case "customer.subscription.deleted":
                    handleSubscriptionDeleted(event);
                    break;
                default:
                    log.info("Unhandled event type: {}", event.getType());
            }
        } catch (Exception e) {
            log.error("Error processing webhook event {}: {}", event.getType(), e.getMessage(), e);
        }
    }

    private void handleSubscriptionCreated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize subscription"));

        String customerId = subscription.getCustomer();
        User user = userService.getUserByStripeCustomerId(customerId);

        subscriptionService.createSubscription(
                user,
                "stripe",
                subscription.getId(),
                customerId,
                subscription.getItems().getData().get(0).getPrice().getId(),
                subscription.getItems().getData().get(0).getPrice().getProduct(),
                subscription.getStatus(),
                subscription.getCurrentPeriodStart(),
                subscription.getCurrentPeriodEnd()
        );

        log.info("Subscription created: {} for customer: {}", subscription.getId(), customerId);
    }

    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize subscription"));

        try {
            subscriptionService.updateSubscription(
                    subscription.getId(),
                    subscription.getStatus(),
                    subscription.getCurrentPeriodStart(),
                    subscription.getCurrentPeriodEnd(),
                    subscription.getCancelAtPeriodEnd()
            );
            log.info("Subscription updated: {}", subscription.getId());
        } catch (RuntimeException e) {
            log.warn("Received update for non-existent subscription: {}", subscription.getId());
        }
    }

    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new RuntimeException("Failed to deserialize subscription"));

        subscriptionService.deleteSubscription(subscription.getId());
        log.info("Subscription deleted: {}", subscription.getId());
    }
}
