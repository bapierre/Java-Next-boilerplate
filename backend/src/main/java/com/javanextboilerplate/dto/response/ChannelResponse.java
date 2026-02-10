package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.Channel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChannelResponse {

    private Long id;
    private String platform;
    private String channelName;
    private String channelUrl;
    private Boolean isActive;
    private LocalDateTime lastSyncedAt;

    public static ChannelResponse from(Channel channel) {
        return ChannelResponse.builder()
                .id(channel.getId())
                .platform(channel.getPlatform().getValue())
                .channelName(channel.getChannelName())
                .channelUrl(channel.getChannelUrl())
                .isActive(channel.getIsActive())
                .lastSyncedAt(channel.getLastSyncedAt())
                .build();
    }
}
