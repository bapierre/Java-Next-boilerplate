package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.ChannelStats;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ChannelStatsResponse {

    private LocalDateTime recordedAt;
    private Long followersCount;

    public static ChannelStatsResponse from(ChannelStats stats) {
        return new ChannelStatsResponse(stats.getRecordedAt(), stats.getFollowersCount());
    }
}
