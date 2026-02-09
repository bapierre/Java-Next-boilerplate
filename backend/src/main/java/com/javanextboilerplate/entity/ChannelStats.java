package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "channel_stats", indexes = {
    @Index(name = "idx_channel_stats_channel_recorded", columnList = "channel_id, recorded_at DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id", nullable = false)
    private Channel channel;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "followers_count")
    @Builder.Default
    private Long followersCount = 0L;

    @Column(name = "following_count")
    @Builder.Default
    private Long followingCount = 0L;

    @Column(name = "total_posts")
    @Builder.Default
    private Integer totalPosts = 0;

    @Column(name = "total_views")
    @Builder.Default
    private Long totalViews = 0L;

    @Column(name = "total_likes")
    @Builder.Default
    private Long totalLikes = 0L;

    @Column(name = "engagement_rate", precision = 5, scale = 2)
    private BigDecimal engagementRate; // Percentage (e.g., 3.45 for 3.45%)

    @Column(name = "avg_views_per_post")
    @Builder.Default
    private Long avgViewsPerPost = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Helper method to calculate engagement rate
    public static BigDecimal calculateEngagementRate(Long totalLikes, Long totalViews) {
        if (totalViews == null || totalViews == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(totalLikes)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalViews), 2, java.math.RoundingMode.HALF_UP);
    }
}
