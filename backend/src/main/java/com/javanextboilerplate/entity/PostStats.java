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
@Table(name = "post_stats", indexes = {
    @Index(name = "idx_post_stats_post_recorded", columnList = "post_id, recorded_at DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "views_count")
    @Builder.Default
    private Long viewsCount = 0L;

    @Column(name = "likes_count")
    @Builder.Default
    private Long likesCount = 0L;

    @Column(name = "comments_count")
    @Builder.Default
    private Long commentsCount = 0L;

    @Column(name = "shares_count")
    @Builder.Default
    private Long sharesCount = 0L;

    @Column(name = "saves_count")
    @Builder.Default
    private Long savesCount = 0L;

    @Column(name = "engagement_rate", precision = 5, scale = 2)
    private BigDecimal engagementRate; // Percentage

    @Column(name = "watch_time_seconds")
    @Builder.Default
    private Long watchTimeSeconds = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Helper method to calculate total engagements
    public Long getTotalEngagements() {
        return (likesCount != null ? likesCount : 0L) +
               (commentsCount != null ? commentsCount : 0L) +
               (sharesCount != null ? sharesCount : 0L) +
               (savesCount != null ? savesCount : 0L);
    }

    // Helper method to calculate engagement rate
    public static BigDecimal calculateEngagementRate(Long totalEngagements, Long views) {
        if (views == null || views == 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(totalEngagements)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(views), 2, java.math.RoundingMode.HALF_UP);
    }
}
