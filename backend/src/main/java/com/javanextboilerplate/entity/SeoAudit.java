package com.javanextboilerplate.entity;

import com.javanextboilerplate.config.SeoCheckListConverter;
import com.javanextboilerplate.dto.response.SeoCheckItem;
import jakarta.persistence.*;
import org.hibernate.annotations.ColumnTransformer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "seo_audits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeoAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false, length = 2000)
    private String url;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "pass_count", nullable = false)
    private Integer passCount;

    @Column(name = "warn_count", nullable = false)
    private Integer warnCount;

    @Column(name = "fail_count", nullable = false)
    private Integer failCount;

    /** Serialised List<SeoCheckItem> stored as JSONB. */
    @Column(columnDefinition = "jsonb", nullable = false)
    @ColumnTransformer(write = "?::jsonb")
    @Convert(converter = SeoCheckListConverter.class)
    private java.util.List<SeoCheckItem> checks;

    @Column(name = "audited_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime auditedAt = LocalDateTime.now();
}
