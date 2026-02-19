package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.PaidAdEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaidAdEntryRepository extends JpaRepository<PaidAdEntry, Long> {

    List<PaidAdEntry> findByCampaignIdOrderByDateAsc(Long campaignId);

    List<PaidAdEntry> findByCampaignIdAndDateBetweenOrderByDateAsc(
            Long campaignId, LocalDate from, LocalDate to);

    Optional<PaidAdEntry> findByCampaignIdAndDate(Long campaignId, LocalDate date);

    /** Sum total spend (in cents) across all campaigns belonging to a project. */
    @Query(value = """
            SELECT COALESCE(SUM(e.spend_cents), 0)
            FROM paid_ad_entries e
            JOIN paid_ad_campaigns c ON c.id = e.campaign_id
            WHERE c.project_id = :projectId
            """, nativeQuery = true)
    long sumSpendCentsByProjectId(@Param("projectId") Long projectId);
}
