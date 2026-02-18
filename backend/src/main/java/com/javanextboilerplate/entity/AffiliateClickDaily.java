package com.javanextboilerplate.entity;

import com.javanextboilerplate.config.IntegerMapConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnTransformer;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "affiliate_click_daily")
@IdClass(AffiliateClickDailyId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffiliateClickDaily {

    @Id
    @Column(name = "campaign_id", nullable = false)
    private Long campaignId;

    @Id
    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_clicks", nullable = false)
    @Builder.Default
    private int totalClicks = 0;

    @Column(name = "unique_clicks", nullable = false)
    @Builder.Default
    private int uniqueClicks = 0;

    @Column(name = "by_referer", columnDefinition = "jsonb", nullable = false)
    @ColumnTransformer(write = "?::jsonb")
    @Convert(converter = IntegerMapConverter.class)
    @Builder.Default
    private Map<String, Integer> byReferer = new HashMap<>();

    @Column(name = "by_device", columnDefinition = "jsonb", nullable = false)
    @ColumnTransformer(write = "?::jsonb")
    @Convert(converter = IntegerMapConverter.class)
    @Builder.Default
    private Map<String, Integer> byDevice = new HashMap<>();
}
