package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.UtmClickDaily;
import com.javanextboilerplate.entity.UtmClickDailyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UtmClickDailyRepository extends JpaRepository<UtmClickDaily, UtmClickDailyId> {

    List<UtmClickDaily> findByUtmLinkIdOrderByDateAsc(Long utmLinkId);

    List<UtmClickDaily> findByUtmLinkIdAndDateBetweenOrderByDateAsc(
            Long utmLinkId, LocalDate from, LocalDate to);

    /**
     * Atomic PostgreSQL UPSERT — same pattern as AffiliateClickDailyRepository.
     */
    @Modifying
    @Query(value = """
            INSERT INTO utm_click_daily (utm_link_id, date, total_clicks, unique_clicks, by_referer, by_device)
            VALUES (:utmLinkId, :date, :totalDelta, :uniqueDelta,
                    jsonb_build_object(:refererKey, :totalDelta),
                    jsonb_build_object(:deviceKey,  :totalDelta))
            ON CONFLICT (utm_link_id, date) DO UPDATE SET
                total_clicks  = utm_click_daily.total_clicks  + :totalDelta,
                unique_clicks = utm_click_daily.unique_clicks + :uniqueDelta,
                by_referer    = utm_click_daily.by_referer ||
                                jsonb_build_object(:refererKey,
                                    COALESCE(CAST(utm_click_daily.by_referer ->> :refererKey AS INTEGER), 0) + :totalDelta),
                by_device     = utm_click_daily.by_device ||
                                jsonb_build_object(:deviceKey,
                                    COALESCE(CAST(utm_click_daily.by_device ->> :deviceKey AS INTEGER), 0) + :totalDelta)
            """, nativeQuery = true)
    void upsertClick(@Param("utmLinkId")   Long utmLinkId,
                     @Param("date")        LocalDate date,
                     @Param("totalDelta")  int totalDelta,
                     @Param("uniqueDelta") int uniqueDelta,
                     @Param("refererKey")  String refererKey,
                     @Param("deviceKey")   String deviceKey);
}
