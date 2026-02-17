package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreateProjectRequest;
import com.javanextboilerplate.dto.request.UpdateProjectRequest;
import com.javanextboilerplate.dto.response.ProjectResponse;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.ProjectType;
import com.javanextboilerplate.entity.SaasProject;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.dto.response.ChannelResponse;
import com.javanextboilerplate.entity.LinkedChannel;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.LinkedChannelRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final SaasProjectRepository projectRepository;
    private final ChannelRepository channelRepository;
    private final LinkedChannelRepository linkedChannelRepository;
    private final UserService userService;
    private final ChannelOAuthService channelOAuthService;

    @Transactional
    public ProjectResponse createProject(String supabaseUserId, String email, CreateProjectRequest request) {
        User user = userService.getOrCreateUser(supabaseUserId, email);

        ProjectType projectType = request.getType() != null
                ? ProjectType.fromValue(request.getType())
                : ProjectType.PRODUCT;

        SaasProject project = SaasProject.builder()
                .userId(user.getId())
                .name(request.getName())
                .description(request.getDescription())
                .websiteUrl(request.getWebsiteUrl())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .type(projectType)
                .build();

        SaasProject saved = projectRepository.save(project);
        log.info("Created project '{}' for user {}", saved.getName(), email);
        return ProjectResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUserProjects(String supabaseUserId, String email) {
        User user = userService.getOrCreateUser(supabaseUserId, email);
        return projectRepository.findByUserIdWithChannels(user.getId()).stream()
                .map(project -> {
                    List<Channel> linked = linkedChannelRepository.findLinkedChannelsByProjectId(project.getId());
                    return ProjectResponse.from(project, linked);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserIdWithChannels(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        List<Channel> linked = linkedChannelRepository.findLinkedChannelsByProjectId(projectId);
        return ProjectResponse.from(project, linked);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, String supabaseUserId, UpdateProjectRequest request) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getWebsiteUrl() != null) {
            project.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.getImageUrl() != null) {
            project.setImageUrl(request.getImageUrl());
        }
        if (request.getCategory() != null) {
            project.setCategory(request.getCategory());
        }
        if (request.getType() != null) {
            project.setType(ProjectType.fromValue(request.getType()));
        }

        SaasProject saved = projectRepository.save(project);
        log.info("Updated project '{}' (id={})", saved.getName(), saved.getId());
        return ProjectResponse.from(saved);
    }

    @Transactional
    public void disconnectChannel(Long projectId, Long channelId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        if (!channel.getProject().getId().equals(project.getId())) {
            throw new RuntimeException("Channel does not belong to this project");
        }

        // Revoke platform token before deleting
        channelOAuthService.revokeToken(channel);

        project.removeChannel(channel);
        channelRepository.delete(channel);
        log.info("Disconnected channel {} from project '{}' (id={})", channelId, project.getName(), project.getId());
    }

    @Transactional
    public void deleteProject(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
        log.info("Deleted project '{}' (id={})", project.getName(), project.getId());
    }

    @Transactional
    public void linkChannel(Long projectId, Long channelId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);

        // Verify project ownership
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Verify channel exists and belongs to the same user
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));
        SaasProject sourceProject = projectRepository.findById(channel.getProject().getId())
                .orElseThrow(() -> new RuntimeException("Source project not found"));
        if (!sourceProject.getUserId().equals(user.getId())) {
            throw new RuntimeException("Channel does not belong to this user");
        }

        // Cannot link a channel to its own project
        if (channel.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Channel already belongs to this project");
        }

        // Prevent duplicate links
        if (linkedChannelRepository.existsByProjectIdAndChannelId(projectId, channelId)) {
            throw new RuntimeException("Channel is already linked to this project");
        }

        LinkedChannel link = LinkedChannel.builder()
                .projectId(projectId)
                .channelId(channelId)
                .build();
        linkedChannelRepository.save(link);
        log.info("Linked channel {} to project '{}' (id={})", channelId, project.getName(), projectId);
    }

    @Transactional
    public void unlinkChannel(Long projectId, Long channelId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);

        // Verify project ownership
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        linkedChannelRepository.deleteByProjectIdAndChannelId(projectId, channelId);
        log.info("Unlinked channel {} from project {}", channelId, projectId);
    }

    @Transactional(readOnly = true)
    public List<ChannelResponse> getLinkableChannels(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);

        // Verify project ownership
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return linkedChannelRepository.findLinkableChannels(projectId, user.getId()).stream()
                .map(ChannelResponse::fromLinked)
                .toList();
    }
}
