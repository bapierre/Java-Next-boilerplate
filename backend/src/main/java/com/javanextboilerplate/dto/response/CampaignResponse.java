package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.AffiliateCampaign;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class CampaignResponse {
    Long id;
    String name;
    String destinationUrl;
    String slug;
    boolean isActive;
    LocalDateTime createdAt;
    long totalClicks;
    String trackingUrl;

    public static CampaignResponse from(AffiliateCampaign c, long totalClicks) {
        return CampaignResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .destinationUrl(c.getDestinationUrl())
                .slug(c.getSlug())
                .isActive(Boolean.TRUE.equals(c.getIsActive()))
                .createdAt(c.getCreatedAt())
                .totalClicks(totalClicks)
                .trackingUrl("/t/" + c.getSlug())
                .build();
    }
}
