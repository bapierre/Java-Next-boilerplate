package com.javanextboilerplate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateOutreachStatusRequest {

    @NotBlank
    @Pattern(regexp = "ONGOING|SUCCESS|FAIL", message = "Status must be ONGOING, SUCCESS, or FAIL")
    private String status;

    private String notes;
}
