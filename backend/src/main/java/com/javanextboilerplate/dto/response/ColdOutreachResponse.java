package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.ColdOutreach;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ColdOutreachResponse {

    private Long id;
    private Long projectId;
    private String platform;
    private String handle;
    private String profileUrl;
    private Long templateId;
    private String messageSent;
    private String notes;
    private String status;
    private LocalDateTime contactedAt;
    private LocalDateTime createdAt;

    public static ColdOutreachResponse from(ColdOutreach o) {
        return ColdOutreachResponse.builder()
                .id(o.getId())
                .projectId(o.getProjectId())
                .platform(o.getPlatform())
                .handle(o.getHandle())
                .profileUrl(o.getProfileUrl())
                .templateId(o.getTemplateId())
                .messageSent(o.getMessageSent())
                .notes(o.getNotes())
                .status(o.getStatus())
                .contactedAt(o.getContactedAt())
                .createdAt(o.getCreatedAt())
                .build();
    }
}
