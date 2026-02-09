package com.javanextboilerplate.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class StripeConfig {

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        Stripe.setConnectTimeout(5000);
        Stripe.setReadTimeout(15000);
        Stripe.setMaxNetworkRetries(2);
        log.info("Stripe API initialized with timeouts and retries");
    }
}
