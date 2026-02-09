package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.Subscription;
import com.javanextboilerplate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findBySubscriptionId(String subscriptionId);

    List<Subscription> findByUser(User user);

    List<Subscription> findByUserIdAndStatus(Long userId, String status);

    List<Subscription> findByProviderAndStatus(String provider, String status);

    Optional<Subscription> findByUserAndProviderAndStatus(User user, String provider, String status);

    boolean existsBySubscriptionId(String subscriptionId);
}
