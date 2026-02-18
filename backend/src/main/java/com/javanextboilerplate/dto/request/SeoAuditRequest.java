package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SeoAuditRequest {

    @NotBlank
    private String url;
}
