package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCampaignRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String destinationUrl;
}
