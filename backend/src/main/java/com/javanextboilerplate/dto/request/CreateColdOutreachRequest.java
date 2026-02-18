package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateColdOutreachRequest {

    @NotBlank
    private String platform;

    @NotBlank
    private String handle;

    private String profileUrl;

    private Long templateId;

    private String messageSent;

    private String notes;
}
