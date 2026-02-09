package com.marketistats.controller;

import com.marketistats.dto.request.CheckoutRequest;
import com.marketistats.dto.response.CheckoutResponse;
import com.marketistats.security.SupabaseUserDetails;
import com.marketistats.service.StripeService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
@RequiredArgsConstructor
@Slf4j
public class StripeController {

    private final StripeService stripeService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> createCheckoutSession(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        try {
            log.info("Creating checkout session for user: {}", userDetails.getEmail());

            String origin = httpRequest.getHeader("origin");
            String checkoutUrl = stripeService.createCheckoutSession(
                    request.getPriceId(),
                    userDetails.getUserId(),
                    userDetails.getEmail(),
                    origin
            );

            return ResponseEntity.ok(new CheckoutResponse(checkoutUrl));
        } catch (StripeException e) {
            log.error("Stripe error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        } catch (Exception e) {
            log.error("Error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
