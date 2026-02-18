package com.javanextboilerplate.entity;

import lombok.Data;

import java.io.Serializable;
import java.time.LocalDate;

@Data
public class AffiliateClickDailyId implements Serializable {
    private Long campaignId;
    private LocalDate date;
}
