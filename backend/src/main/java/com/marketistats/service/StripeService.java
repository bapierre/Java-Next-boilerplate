package com.marketistats.service;

import com.marketistats.entity.User;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final UserService userService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${stripe.allowed-price-ids:}")
    private String allowedPriceIdsConfig;

    private Set<String> allowedPriceIds;

    @PostConstruct
    public void init() {
        if (allowedPriceIdsConfig != null && !allowedPriceIdsConfig.isBlank()) {
            allowedPriceIds = Arrays.stream(allowedPriceIdsConfig.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
            log.info("Stripe allowed price IDs: {}", allowedPriceIds);
        } else {
            allowedPriceIds = Set.of();
            log.warn("No Stripe allowed price IDs configured - all price IDs will be accepted");
        }
    }

    public String createCheckoutSession(String priceId, String supabaseUserId, String email, String origin) throws StripeException {
        // Validate priceId against allowlist if configured
        if (!allowedPriceIds.isEmpty() && !allowedPriceIds.contains(priceId)) {
            throw new IllegalArgumentException("Invalid price ID");
        }

        // Get or create user
        User user = userService.getOrCreateUser(supabaseUserId, email);

        // Get or create Stripe customer
        String customerId = userService.getOrCreateStripeCustomer(user);

        // Always use configured frontend URL to prevent open redirect via Origin header
        String baseUrl = frontendUrl;

        // Create checkout session
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .setSuccessUrl(baseUrl + "/dashboard?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(baseUrl + "/pricing")
                .build();

        Session session = Session.create(params);

        log.info("Created Stripe checkout session {} for user {}", session.getId(), email);
        return session.getUrl();
    }
}
