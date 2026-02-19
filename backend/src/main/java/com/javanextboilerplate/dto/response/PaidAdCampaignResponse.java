package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.PaidAdCampaign;
import com.javanextboilerplate.entity.PaidAdEntry;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;
import java.util.List;

@Value
@Builder
public class PaidAdCampaignResponse {
    Long id;
    String name;
    String platform;
    LocalDateTime createdAt;
    long totalSpendCents;
    long totalClicks;
    long totalImpressions;
    long totalConversions;

    public static PaidAdCampaignResponse from(PaidAdCampaign c, List<PaidAdEntry> entries) {
        long spendCents  = entries.stream().mapToLong(PaidAdEntry::getSpendCents).sum();
        long clicks      = entries.stream().mapToLong(PaidAdEntry::getClicks).sum();
        long impressions = entries.stream().mapToLong(PaidAdEntry::getImpressions).sum();
        long conversions = entries.stream().mapToLong(PaidAdEntry::getConversions).sum();
        return PaidAdCampaignResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .platform(c.getPlatform())
                .createdAt(c.getCreatedAt())
                .totalSpendCents(spendCents)
                .totalClicks(clicks)
                .totalImpressions(impressions)
                .totalConversions(conversions)
                .build();
    }
}
