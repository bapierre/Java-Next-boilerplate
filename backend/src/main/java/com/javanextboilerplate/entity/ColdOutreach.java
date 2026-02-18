package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cold_outreaches", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "platform", "handle"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ColdOutreach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 50)
    private String platform;

    @Column(nullable = false)
    private String handle;

    @Column(name = "profile_url")
    private String profileUrl;

    @Column(name = "template_id")
    private Long templateId;

    @Column(name = "message_sent", columnDefinition = "TEXT")
    private String messageSent;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "ONGOING";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String type = "COLD";

    @Column(name = "contacted_at", nullable = false)
    @Builder.Default
    private LocalDateTime contactedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
