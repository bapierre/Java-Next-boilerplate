package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.PostStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostStatsRepository extends JpaRepository<PostStats, Long> {

    /**
     * Find all stats for a post ordered by date
     */
    List<PostStats> findByPostIdOrderByRecordedAtDesc(Long postId);

    /**
     * Find stats in a date range
     */
    List<PostStats> findByPostIdAndRecordedAtBetweenOrderByRecordedAtAsc(
        Long postId, LocalDateTime startDate, LocalDateTime endDate
    );

    /**
     * Find the latest stats for a post
     */
    @Query("SELECT ps FROM PostStats ps WHERE ps.post.id = :postId ORDER BY ps.recordedAt DESC LIMIT 1")
    Optional<PostStats> findLatestByPostId(Long postId);

    /**
     * Find stats recorded after a certain date
     */
    List<PostStats> findByPostIdAndRecordedAtAfter(Long postId, LocalDateTime since);

    /**
     * Get total views for all posts in a channel
     */
    @Query("SELECT SUM(ps.viewsCount) FROM PostStats ps WHERE ps.post.channel.id = :channelId AND ps.recordedAt = (SELECT MAX(ps2.recordedAt) FROM PostStats ps2 WHERE ps2.post.id = ps.post.id)")
    Long getTotalViewsForChannel(Long channelId);

    /**
     * Get top performing posts by views
     */
    @Query("SELECT ps.post.id, MAX(ps.viewsCount) as maxViews FROM PostStats ps WHERE ps.post.channel.id = :channelId GROUP BY ps.post.id ORDER BY maxViews DESC")
    List<Object[]> getTopPostsByViews(Long channelId);

    /**
     * Get average engagement rate for posts in a channel
     */
    @Query("SELECT AVG(ps.engagementRate) FROM PostStats ps WHERE ps.post.channel.id = :channelId AND ps.recordedAt = (SELECT MAX(ps2.recordedAt) FROM PostStats ps2 WHERE ps2.post.id = ps.post.id)")
    Double getAverageEngagementRateForChannel(Long channelId);
}
