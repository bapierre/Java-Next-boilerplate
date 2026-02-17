package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.request.CreateProjectRequest;
import com.javanextboilerplate.dto.request.LinkChannelRequest;
import com.javanextboilerplate.dto.request.UpdateProjectRequest;
import com.javanextboilerplate.dto.response.ChannelResponse;
import com.javanextboilerplate.dto.response.ProjectResponse;
import com.javanextboilerplate.dto.response.ProjectStatsResponse;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.Platform;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.ChannelStatsRepository;
import com.javanextboilerplate.repository.LinkedChannelRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.ProjectService;
import com.javanextboilerplate.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final UserService userService;
    private final SaasProjectRepository projectRepository;
    private final ChannelStatsRepository channelStatsRepository;
    private final ChannelRepository channelRepository;
    private final LinkedChannelRepository linkedChannelRepository;

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

    @GetMapping("/{id}/linkable-channels")
    public ResponseEntity<List<ChannelResponse>> getLinkableChannels(
            @PathVariable Long id,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        List<ChannelResponse> channels = projectService.getLinkableChannels(id, userDetails.getUserId());
        return ResponseEntity.ok(channels);
    }

    @PostMapping("/{id}/channels/link")
    public ResponseEntity<Void> linkChannel(
            @PathVariable Long id,
            @Valid @RequestBody LinkChannelRequest request,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        projectService.linkChannel(id, request.getChannelId(), userDetails.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{projectId}/linked-channels/{channelId}")
    public ResponseEntity<Void> unlinkChannel(
            @PathVariable Long projectId,
            @PathVariable Long channelId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        projectService.unlinkChannel(projectId, channelId, userDetails.getUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ProjectStatsResponse> getProjectStats(
            @PathVariable Long id,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        User user = userService.getUserBySupabaseId(userDetails.getUserId());
        projectRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Collect all channel IDs: owned + linked
        List<Long> channelIds = getAllChannelIds(id);

        if (channelIds.isEmpty()) {
            return ResponseEntity.ok(new ProjectStatsResponse(0L, null, List.of(), List.of()));
        }

        // Get timeline data (aggregated by day across all channels)
        // Native query returns Timestamp for the date column and Long/BigInteger for the sum.
        List<Object[]> timelineRaw = channelStatsRepository.getFollowerTimelineByChannelIds(channelIds);
        List<ProjectStatsResponse.TimelinePoint> timeline = timelineRaw.stream()
                .map(row -> new ProjectStatsResponse.TimelinePoint(
                        ((Timestamp) row[0]).toLocalDateTime(),
                        ((Number) row[1]).longValue()
                ))
                .toList();

        // Get per-platform breakdown (JPQL query, returns Platform enum + Long directly)
        List<Object[]> platformRaw = channelRepository.getFollowersByChannelIds(channelIds);
        List<ProjectStatsResponse.PlatformBreakdown> platforms = platformRaw.stream()
                .map(row -> new ProjectStatsResponse.PlatformBreakdown(
                        ((Platform) row[0]).name().toLowerCase(),
                        ((Number) row[1]).longValue()
                ))
                .toList();

        // Compute total followers from platform breakdown
        long totalFollowers = platforms.stream()
                .mapToLong(ProjectStatsResponse.PlatformBreakdown::getFollowers)
                .sum();

        // Compute growth % from timeline
        Double growthPercent = null;
        if (timeline.size() >= 2) {
            long earliest = timeline.getFirst().getTotalFollowers();
            long latest = timeline.getLast().getTotalFollowers();
            if (earliest > 0) {
                growthPercent = ((double) (latest - earliest) / earliest) * 100.0;
            }
        }

        return ResponseEntity.ok(new ProjectStatsResponse(totalFollowers, growthPercent, timeline, platforms));
    }

    private List<Long> getAllChannelIds(Long projectId) {
        List<Long> ownedIds = channelRepository.findByProjectId(projectId).stream()
                .map(Channel::getId)
                .toList();
        List<Long> linkedIds = linkedChannelRepository.findLinkedChannelsByProjectId(projectId).stream()
                .map(Channel::getId)
                .toList();
        List<Long> allIds = new ArrayList<>(ownedIds);
        allIds.addAll(linkedIds);
        return allIds;
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
