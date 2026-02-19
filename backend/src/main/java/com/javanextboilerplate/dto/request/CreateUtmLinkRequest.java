package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateUtmLinkRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String destinationUrl;

    @NotBlank
    private String utmSource;

    @NotBlank
    private String utmMedium;

    @NotBlank
    private String utmCampaign;

    private String utmContent;
    private String utmTerm;
}
