package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.SaasProject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private BigDecimal mrr;
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
                .mrr(project.getMrr())
                .channels(project.getChannels().stream()
                        .map(ChannelResponse::from)
                        .toList())
                .createdAt(project.getCreatedAt())
                .build();
    }

    public static ProjectResponse from(SaasProject project, List<Channel> linkedChannels) {
        List<ChannelResponse> allChannels = new ArrayList<>(
                project.getChannels().stream().map(ChannelResponse::from).toList());
        allChannels.addAll(linkedChannels.stream().map(ChannelResponse::fromLinked).toList());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .websiteUrl(project.getWebsiteUrl())
                .imageUrl(project.getImageUrl())
                .category(project.getCategory())
                .type(project.getType().getValue())
                .mrr(project.getMrr())
                .channels(allChannels)
                .createdAt(project.getCreatedAt())
                .build();
    }
}
