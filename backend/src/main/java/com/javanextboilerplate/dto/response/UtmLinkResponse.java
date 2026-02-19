package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.UtmLink;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UtmLinkResponse {
    Long id;
    Long campaignId;
    String name;
    String destinationUrl;
    String utmSource;
    String utmMedium;
    String utmCampaign;
    String utmContent;
    String utmTerm;
    String slug;
    boolean isActive;
    LocalDateTime createdAt;
    long totalClicks;
    String trackingUrl;

    public static UtmLinkResponse from(UtmLink link, long totalClicks) {
        return UtmLinkResponse.builder()
                .id(link.getId())
                .campaignId(link.getCampaignId())
                .name(link.getName())
                .destinationUrl(link.getDestinationUrl())
                .utmSource(link.getUtmSource())
                .utmMedium(link.getUtmMedium())
                .utmCampaign(link.getUtmCampaign())
                .utmContent(link.getUtmContent())
                .utmTerm(link.getUtmTerm())
                .slug(link.getSlug())
                .isActive(Boolean.TRUE.equals(link.getIsActive()))
                .createdAt(link.getCreatedAt())
                .totalClicks(totalClicks)
                .trackingUrl("/t/" + link.getSlug())
                .build();
    }
}
