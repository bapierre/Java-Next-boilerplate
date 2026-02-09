package com.marketistats.repository;

import com.marketistats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findBySupabaseUserId(String supabaseUserId);

    Optional<User> findByStripeCustomerId(String stripeCustomerId);

    boolean existsByEmail(String email);

    boolean existsBySupabaseUserId(String supabaseUserId);
}
