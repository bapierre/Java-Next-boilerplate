package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    /**
     * Find all posts for a channel
     */
    Page<Post> findByChannelId(Long channelId, Pageable pageable);

    /**
     * Find posts ordered by published date
     */
    Page<Post> findByChannelIdOrderByPublishedAtDesc(Long channelId, Pageable pageable);

    /**
     * Find a specific post by platform ID
     */
    Optional<Post> findByChannelIdAndPlatformPostId(Long channelId, String platformPostId);

    /**
     * Find posts published in a date range
     */
    List<Post> findByChannelIdAndPublishedAtBetween(Long channelId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find recent posts (last N days)
     */
    @Query("SELECT p FROM Post p WHERE p.channel.id = :channelId AND p.publishedAt >= :since ORDER BY p.publishedAt DESC")
    List<Post> findRecentPosts(Long channelId, LocalDateTime since);

    /**
     * Count total posts for a channel
     */
    long countByChannelId(Long channelId);

    /**
     * Find posts with their latest stats
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.stats WHERE p.channel.id = :channelId ORDER BY p.publishedAt DESC")
    Page<Post> findByChannelIdWithStats(Long channelId, Pageable pageable);
}
