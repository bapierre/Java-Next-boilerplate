package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.PaidAdEntry;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class PaidAdEntryResponse {
    Long id;
    Long campaignId;
    LocalDate date;
    int spendCents;
    int clicks;
    int impressions;
    int conversions;
    String notes;

    public static PaidAdEntryResponse from(PaidAdEntry e) {
        return PaidAdEntryResponse.builder()
                .id(e.getId())
                .campaignId(e.getCampaignId())
                .date(e.getDate())
                .spendCents(e.getSpendCents())
                .clicks(e.getClicks())
                .impressions(e.getImpressions())
                .conversions(e.getConversions())
                .notes(e.getNotes())
                .build();
    }
}
