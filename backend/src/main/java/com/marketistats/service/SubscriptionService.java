package com.marketistats.service;

import com.marketistats.entity.Subscription;
import com.marketistats.entity.User;
import com.marketistats.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public Subscription createSubscription(
            User user,
            String provider,
            String subscriptionId,
            String customerId,
            String priceId,
            String productId,
            String status,
            Long currentPeriodStart,
            Long currentPeriodEnd
    ) {
        Subscription subscription = Subscription.builder()
                .user(user)
                .provider(provider)
                .subscriptionId(subscriptionId)
                .customerId(customerId)
                .priceId(priceId)
                .productId(productId)
                .status(status)
                .currentPeriodStart(currentPeriodStart != null ?
                        LocalDateTime.ofInstant(Instant.ofEpochSecond(currentPeriodStart), ZoneOffset.UTC) : null)
                .currentPeriodEnd(currentPeriodEnd != null ?
                        LocalDateTime.ofInstant(Instant.ofEpochSecond(currentPeriodEnd), ZoneOffset.UTC) : null)
                .cancelAtPeriodEnd(false)
                .build();

        Subscription saved = subscriptionRepository.save(subscription);
        log.info("Created subscription {} for user {}", subscriptionId, user.getEmail());
        return saved;
    }

    @Transactional
    public Subscription updateSubscription(
            String subscriptionId,
            String status,
            Long currentPeriodStart,
            Long currentPeriodEnd,
            Boolean cancelAtPeriodEnd
    ) {
        Subscription subscription = subscriptionRepository.findBySubscriptionId(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));

        subscription.setStatus(status);
        if (currentPeriodStart != null) {
            subscription.setCurrentPeriodStart(
                    LocalDateTime.ofInstant(Instant.ofEpochSecond(currentPeriodStart), ZoneOffset.UTC));
        }
        if (currentPeriodEnd != null) {
            subscription.setCurrentPeriodEnd(
                    LocalDateTime.ofInstant(Instant.ofEpochSecond(currentPeriodEnd), ZoneOffset.UTC));
        }
        if (cancelAtPeriodEnd != null) {
            subscription.setCancelAtPeriodEnd(cancelAtPeriodEnd);
        }

        Subscription updated = subscriptionRepository.save(subscription);
        log.info("Updated subscription {} to status {}", subscriptionId, status);
        return updated;
    }

    @Transactional
    public void deleteSubscription(String subscriptionId) {
        Subscription subscription = subscriptionRepository.findBySubscriptionId(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));

        subscription.setStatus("canceled");
        subscriptionRepository.save(subscription);
        log.info("Marked subscription {} as canceled", subscriptionId);
    }

    @Transactional(readOnly = true)
    public List<Subscription> getUserSubscriptions(User user) {
        return subscriptionRepository.findByUser(user);
    }

    @Transactional(readOnly = true)
    public boolean subscriptionExists(String subscriptionId) {
        return subscriptionRepository.existsBySubscriptionId(subscriptionId);
    }
}
