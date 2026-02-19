package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.PaidAdCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaidAdCampaignRepository extends JpaRepository<PaidAdCampaign, Long> {

    List<PaidAdCampaign> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
