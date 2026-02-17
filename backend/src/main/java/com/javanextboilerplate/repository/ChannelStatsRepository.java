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
     * Get daily total followers across all channels for a project (for sparkline)
     */
    @Query("SELECT cs.recordedAt, SUM(cs.followersCount) " +
           "FROM ChannelStats cs " +
           "WHERE cs.channel.project.id = :projectId " +
           "GROUP BY cs.recordedAt " +
           "ORDER BY cs.recordedAt ASC")
    List<Object[]> getProjectFollowerTimeline(@Param("projectId") Long projectId);

    /**
     * Get follower timeline aggregated across a set of channel IDs (owned + linked)
     */
    @Query("SELECT cs.recordedAt, SUM(cs.followersCount) " +
           "FROM ChannelStats cs " +
           "WHERE cs.channel.id IN :channelIds " +
           "GROUP BY cs.recordedAt " +
           "ORDER BY cs.recordedAt ASC")
    List<Object[]> getFollowerTimelineByChannelIds(@Param("channelIds") List<Long> channelIds);
}
