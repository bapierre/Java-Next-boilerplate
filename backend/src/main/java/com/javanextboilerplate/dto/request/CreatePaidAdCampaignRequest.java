package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePaidAdCampaignRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String platform;
}
