package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "saas_projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaasProject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId; // References users.id

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "website_url", length = 500)
    private String websiteUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 100)
    private String category;

    @Column(precision = 12, scale = 2)
    private BigDecimal mrr;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    @Builder.Default
    private ProjectType type = ProjectType.PRODUCT;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Channel> channels = new ArrayList<>();

    // Helper methods
    public void addChannel(Channel channel) {
        channels.add(channel);
        channel.setProject(this);
    }

    public void removeChannel(Channel channel) {
        channels.remove(channel);
        channel.setProject(null);
    }
}
