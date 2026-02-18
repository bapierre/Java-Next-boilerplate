package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.OutreachTemplate;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OutreachTemplateResponse {

    private Long id;
    private Long projectId;
    private String name;
    private String content;
    private LocalDateTime createdAt;

    public static OutreachTemplateResponse from(OutreachTemplate t) {
        return OutreachTemplateResponse.builder()
                .id(t.getId())
                .projectId(t.getProjectId())
                .name(t.getName())
                .content(t.getContent())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
