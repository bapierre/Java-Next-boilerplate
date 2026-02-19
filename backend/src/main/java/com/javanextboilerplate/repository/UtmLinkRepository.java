package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.UtmLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtmLinkRepository extends JpaRepository<UtmLink, Long> {

    List<UtmLink> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<UtmLink> findByCampaignId(Long campaignId);

    Optional<UtmLink> findBySlug(String slug);
}
