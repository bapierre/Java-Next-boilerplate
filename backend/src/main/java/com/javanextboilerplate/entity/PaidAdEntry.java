package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "paid_ad_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaidAdEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "campaign_id", nullable = false)
    private Long campaignId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "spend_cents", nullable = false)
    @Builder.Default
    private int spendCents = 0;

    @Column(nullable = false)
    @Builder.Default
    private int clicks = 0;

    @Column(nullable = false)
    @Builder.Default
    private int impressions = 0;

    @Column(nullable = false)
    @Builder.Default
    private int conversions = 0;

    @Column
    private String notes;
}
