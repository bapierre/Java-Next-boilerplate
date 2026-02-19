package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "utm_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtmLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "destination_url", nullable = false, length = 2000)
    private String destinationUrl;

    @Column(name = "utm_source", nullable = false, length = 200)
    private String utmSource;

    @Column(name = "utm_medium", nullable = false, length = 200)
    private String utmMedium;

    @Column(name = "utm_campaign", nullable = false, length = 200)
    private String utmCampaign;

    @Column(name = "utm_content", length = 200)
    private String utmContent;

    @Column(name = "utm_term", length = 200)
    private String utmTerm;

    @Column(nullable = false, length = 50, unique = true)
    private String slug;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
