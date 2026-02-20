package com.javanextboilerplate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeoCheckItem {

    private String id;
    private String category;
    private String label;
    /** PASS | WARN | FAIL | INFO */
    private String status;
    private String detail;
    private String recommendation;
}
