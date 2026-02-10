package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.SaasProject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private String websiteUrl;
    private String imageUrl;
    private String category;
    private String type;
    private List<ChannelResponse> channels;
    private LocalDateTime createdAt;

    public static ProjectResponse from(SaasProject project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .websiteUrl(project.getWebsiteUrl())
                .imageUrl(project.getImageUrl())
                .category(project.getCategory())
                .type(project.getType().getValue())
                .channels(project.getChannels().stream()
                        .map(ChannelResponse::from)
                        .toList())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
