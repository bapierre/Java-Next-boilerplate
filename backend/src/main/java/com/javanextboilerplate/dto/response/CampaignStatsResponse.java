package com.javanextboilerplate.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Value
@Builder
public class CampaignStatsResponse {
    List<DailyClickPoint> timeline;
    Map<String, Integer> byReferer;
    Map<String, Integer> byDevice;
    int totalClicks;
    int uniqueClicks;

    @Value
    @Builder
    public static class DailyClickPoint {
        LocalDate date;
        int totalClicks;
        int uniqueClicks;
    }
}
