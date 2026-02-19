package com.javanextboilerplate.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;

@Value
@Builder
public class PaidAdStatsResponse {
    List<DailyAdPoint> timeline;
    int totalSpendCents;
    int totalClicks;
    int totalImpressions;
    int totalConversions;
    double cpc;
    double cpa;
    double ctr;

    @Value
    @Builder
    public static class DailyAdPoint {
        LocalDate date;
        int spendCents;
        int clicks;
        int impressions;
        int conversions;
    }
}
