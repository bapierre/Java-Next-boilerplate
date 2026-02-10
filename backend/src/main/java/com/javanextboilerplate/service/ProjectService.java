package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.request.CreateProjectRequest;
import com.javanextboilerplate.dto.request.UpdateProjectRequest;
import com.javanextboilerplate.dto.response.ProjectResponse;
import com.javanextboilerplate.entity.SaasProject;
import com.javanextboilerplate.entity.User;
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
    private final UserService userService;

    @Transactional
    public ProjectResponse createProject(String supabaseUserId, String email, CreateProjectRequest request) {
        User user = userService.getOrCreateUser(supabaseUserId, email);

        SaasProject project = SaasProject.builder()
                .userId(user.getId())
                .name(request.getName())
                .description(request.getDescription())
                .websiteUrl(request.getWebsiteUrl())
                .imageUrl(request.getImageUrl())
                .category(request.getCategory())
                .build();

        SaasProject saved = projectRepository.save(project);
        log.info("Created project '{}' for user {}", saved.getName(), email);
        return ProjectResponse.from(saved);
    }

    @Transactional
    public List<ProjectResponse> getUserProjects(String supabaseUserId, String email) {
        User user = userService.getOrCreateUser(supabaseUserId, email);
        return projectRepository.findByUserIdWithChannels(user.getId()).stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        return ProjectResponse.from(project);
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

        SaasProject saved = projectRepository.save(project);
        log.info("Updated project '{}' (id={})", saved.getName(), saved.getId());
        return ProjectResponse.from(saved);
    }

    @Transactional
    public void deleteProject(Long projectId, String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        SaasProject project = projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));
        projectRepository.delete(project);
        log.info("Deleted project '{}' (id={})", project.getName(), project.getId());
    }
}
