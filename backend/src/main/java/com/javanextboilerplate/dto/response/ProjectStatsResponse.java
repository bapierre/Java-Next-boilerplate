package com.javanextboilerplate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class ProjectStatsResponse {
    private Long totalFollowers;
    private Double growthPercent;
    private List<TimelinePoint> timeline;
    private List<PlatformBreakdown> platforms;

    @Data
    @AllArgsConstructor
    public static class TimelinePoint {
        private LocalDateTime date;
        private Long totalFollowers;
    }

    @Data
    @AllArgsConstructor
    public static class PlatformBreakdown {
        private String platform;
        private Long followers;
    }
}
