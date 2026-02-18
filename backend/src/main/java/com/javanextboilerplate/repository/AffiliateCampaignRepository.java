package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.AffiliateCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AffiliateCampaignRepository extends JpaRepository<AffiliateCampaign, Long> {

    List<AffiliateCampaign> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<AffiliateCampaign> findBySlug(String slug);
}
