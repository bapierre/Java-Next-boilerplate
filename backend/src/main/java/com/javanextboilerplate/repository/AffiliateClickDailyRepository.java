package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.AffiliateClickDaily;
import com.javanextboilerplate.entity.AffiliateClickDailyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AffiliateClickDailyRepository extends JpaRepository<AffiliateClickDaily, AffiliateClickDailyId> {

    List<AffiliateClickDaily> findByCampaignIdOrderByDateAsc(Long campaignId);

    List<AffiliateClickDaily> findByCampaignIdAndDateBetweenOrderByDateAsc(
            Long campaignId, LocalDate from, LocalDate to);

    /** Sum total clicks across all campaigns belonging to a project. */
    @Query(value = """
            SELECT COALESCE(SUM(d.total_clicks), 0)
            FROM affiliate_click_daily d
            JOIN affiliate_campaigns c ON c.id = d.campaign_id
            WHERE c.project_id = :projectId
            """, nativeQuery = true)
    long sumTotalClicksByProjectId(@Param("projectId") Long projectId);

    /**
     * Atomic PostgreSQL UPSERT: inserts a new row for the day or increments
     * the counters and JSONB maps if a row already exists.
     *
     * Using native UPSERT avoids the JPA merge/persist ambiguity that arises
     * with composite PKs where Spring Data always calls em.merge() regardless
     * of whether the row is new.
     */
    @Modifying
    @Query(value = """
            INSERT INTO affiliate_click_daily (campaign_id, date, total_clicks, unique_clicks, by_referer, by_device)
            VALUES (:campaignId, :date, :totalDelta, :uniqueDelta,
                    jsonb_build_object(:refererKey, :totalDelta),
                    jsonb_build_object(:deviceKey,  :totalDelta))
            ON CONFLICT (campaign_id, date) DO UPDATE SET
                total_clicks  = affiliate_click_daily.total_clicks  + :totalDelta,
                unique_clicks = affiliate_click_daily.unique_clicks + :uniqueDelta,
                by_referer    = affiliate_click_daily.by_referer ||
                                jsonb_build_object(:refererKey,
                                    COALESCE(CAST(affiliate_click_daily.by_referer ->> :refererKey AS INTEGER), 0) + :totalDelta),
                by_device     = affiliate_click_daily.by_device ||
                                jsonb_build_object(:deviceKey,
                                    COALESCE(CAST(affiliate_click_daily.by_device ->> :deviceKey AS INTEGER), 0) + :totalDelta)
            """, nativeQuery = true)
    void upsertClick(@Param("campaignId") Long campaignId,
                     @Param("date")       LocalDate date,
                     @Param("totalDelta") int totalDelta,
                     @Param("uniqueDelta") int uniqueDelta,
                     @Param("refererKey") String refererKey,
                     @Param("deviceKey")  String deviceKey);
}
