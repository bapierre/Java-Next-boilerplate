package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOutreachTemplateRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String content;
}
