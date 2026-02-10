package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "channels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "platform", "channel_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private SaasProject project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Platform platform;

    @Column(name = "channel_name", nullable = false)
    private String channelName;

    @Column(name = "channel_id")
    private String channelId; // Platform-specific ID

    @Column(name = "channel_url", length = 500)
    private String channelUrl;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken; // TODO: Encrypt in production

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken; // TODO: Encrypt in production

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @Column(name = "follower_count")
    private Long followerCount;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChannelStats> stats = new ArrayList<>();

    // Helper methods
    public void addPost(Post post) {
        posts.add(post);
        post.setChannel(this);
    }

    public void removePost(Post post) {
        posts.remove(post);
        post.setChannel(null);
    }

    public boolean isTokenExpired() {
        return tokenExpiresAt != null && LocalDateTime.now().isAfter(tokenExpiresAt);
    }
}
