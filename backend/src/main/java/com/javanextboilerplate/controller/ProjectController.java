package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreateProjectRequest;
import com.javanextboilerplate.dto.request.UpdateProjectRequest;
import com.javanextboilerplate.dto.response.ProjectResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> listProjects(
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        List<ProjectResponse> projects = projectService.getUserProjects(userDetails.getUserId(), userDetails.getEmail());
        return ResponseEntity.ok(projects);
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        ProjectResponse project = projectService.createProject(
                userDetails.getUserId(), userDetails.getEmail(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable Long id,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        ProjectResponse project = projectService.getProject(id, userDetails.getUserId());
        return ResponseEntity.ok(project);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        ProjectResponse project = projectService.updateProject(id, userDetails.getUserId(), request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{projectId}/channels/{channelId}")
    public ResponseEntity<Void> disconnectChannel(
            @PathVariable Long projectId,
            @PathVariable Long channelId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        projectService.disconnectChannel(projectId, channelId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        projectService.deleteProject(id, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }
}
