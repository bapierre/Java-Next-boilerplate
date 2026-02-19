package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreatePaidAdEntryRequest {

    @NotNull
    private LocalDate date;

    private int spendCents;
    private int clicks;
    private int impressions;
    private int conversions;
    private String notes;
}
