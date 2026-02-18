package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.ChannelStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelStatsRepository extends JpaRepository<ChannelStats, Long> {

    /**
     * Find all stats for a channel ordered by date
     */
    List<ChannelStats> findByChannelIdOrderByRecordedAtDesc(Long channelId);

    /**
     * Find stats in a date range
     */
    List<ChannelStats> findByChannelIdAndRecordedAtBetweenOrderByRecordedAtAsc(
        Long channelId, LocalDateTime startDate, LocalDateTime endDate
    );

    /**
     * Find the latest stats for a channel
     */
    @Query("SELECT cs FROM ChannelStats cs WHERE cs.channel.id = :channelId ORDER BY cs.recordedAt DESC LIMIT 1")
    Optional<ChannelStats> findLatestByChannelId(Long channelId);

    /**
     * Find stats recorded after a certain date
     */
    List<ChannelStats> findByChannelIdAndRecordedAtAfter(Long channelId, LocalDateTime since);

    /**
     * Get average engagement rate for a channel over a period
     */
    @Query("SELECT AVG(cs.engagementRate) FROM ChannelStats cs WHERE cs.channel.id = :channelId AND cs.recordedAt BETWEEN :startDate AND :endDate")
    Double getAverageEngagementRate(Long channelId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get follower growth for a channel
     */
    @Query("SELECT cs.recordedAt, cs.followersCount FROM ChannelStats cs WHERE cs.channel.id = :channelId AND cs.recordedAt BETWEEN :startDate AND :endDate ORDER BY cs.recordedAt ASC")
    List<Object[]> getFollowerGrowth(Long channelId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Get daily total followers across all channels for a project (for sparkline).
     * Uses DISTINCT ON to take only the latest snapshot per channel per day before summing,
     * so repeated syncs on the same day don't inflate the total.
     */
    @Query(value =
        "SELECT day, SUM(followers_count) AS total_followers " +
        "FROM ( " +
        "  SELECT DISTINCT ON (cs.channel_id, DATE_TRUNC('day', cs.recorded_at)) " +
        "    cs.channel_id, " +
        "    DATE_TRUNC('day', cs.recorded_at) AS day, " +
        "    cs.followers_count " +
        "  FROM channel_stats cs " +
        "  JOIN channels c ON cs.channel_id = c.id " +
        "  WHERE c.project_id = :projectId " +
        "  ORDER BY cs.channel_id, DATE_TRUNC('day', cs.recorded_at), cs.recorded_at DESC " +
        ") latest_per_channel_day " +
        "GROUP BY day " +
        "ORDER BY day ASC",
        nativeQuery = true)
    List<Object[]> getProjectFollowerTimeline(@Param("projectId") Long projectId);

    /**
     * Get one snapshot per day for a channel (latest recorded_at wins).
     * Uses DISTINCT ON to deduplicate multiple syncs within the same day.
     */
    @Query(value =
        "SELECT DISTINCT ON (DATE_TRUNC('day', recorded_at)) " +
        "  DATE_TRUNC('day', recorded_at) AS day, followers_count " +
        "FROM channel_stats " +
        "WHERE channel_id = :channelId AND recorded_at BETWEEN :startDate AND :endDate " +
        "ORDER BY DATE_TRUNC('day', recorded_at), recorded_at DESC",
        nativeQuery = true)
    List<Object[]> findDailySnapshotsByChannelId(
        @Param("channelId") Long channelId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Get follower timeline aggregated across a set of channel IDs (owned + linked).
     * Uses DISTINCT ON to take only the latest snapshot per channel per day before summing,
     * so repeated syncs on the same day don't inflate the total.
     */
    @Query(value =
        "SELECT day, SUM(followers_count) AS total_followers " +
        "FROM ( " +
        "  SELECT DISTINCT ON (channel_id, DATE_TRUNC('day', recorded_at)) " +
        "    channel_id, " +
        "    DATE_TRUNC('day', recorded_at) AS day, " +
        "    followers_count " +
        "  FROM channel_stats " +
        "  WHERE channel_id IN :channelIds " +
        "  ORDER BY channel_id, DATE_TRUNC('day', recorded_at), recorded_at DESC " +
        ") latest_per_channel_day " +
        "GROUP BY day " +
        "ORDER BY day ASC",
        nativeQuery = true)
    List<Object[]> getFollowerTimelineByChannelIds(@Param("channelIds") List<Long> channelIds);
}
