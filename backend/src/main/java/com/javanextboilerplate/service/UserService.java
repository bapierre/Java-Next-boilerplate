package com.javanextboilerplate.service;

import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    @CacheEvict(value = "users", key = "#supabaseUserId")
    public User getOrCreateUser(String supabaseUserId, String email) {
        return userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .supabaseUserId(supabaseUserId)
                            .email(email)
                            .build();
                    User savedUser = userRepository.save(newUser);
                    log.info("Created new user: {} ({})", email, supabaseUserId);
                    return savedUser;
                });
    }

    @Transactional
    @CacheEvict(value = "users", key = "#user.supabaseUserId")
    public String getOrCreateStripeCustomer(User user) throws StripeException {
        if (user.getStripeCustomerId() != null) {
            return user.getStripeCustomerId();
        }

        // Create new Stripe customer
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getName())
                .putMetadata("supabase_user_id", user.getSupabaseUserId())
                .build();

        Customer customer = Customer.create(params);

        user.setStripeCustomerId(customer.getId());
        userRepository.save(user);

        log.info("Created Stripe customer {} for user {}", customer.getId(), user.getEmail());
        return customer.getId();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#supabaseUserId")
    public User getUserBySupabaseId(String supabaseUserId) {
        return userRepository.findBySupabaseUserId(supabaseUserId)
                .orElseThrow(() -> new RuntimeException("User not found with Supabase ID: " + supabaseUserId));
    }

    @Transactional(readOnly = true)
    public User getUserByStripeCustomerId(String stripeCustomerId) {
        return userRepository.findByStripeCustomerId(stripeCustomerId)
                .orElseThrow(() -> new RuntimeException("User not found with Stripe customer ID: " + stripeCustomerId));
    }
}
