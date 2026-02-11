package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.response.ChannelStatsResponse;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.ChannelStats;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.ChannelStatsRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/channels/{channelId}/stats")
@RequiredArgsConstructor
public class ChannelStatsController {

    private final ChannelRepository channelRepository;
    private final ChannelStatsRepository channelStatsRepository;
    private final SaasProjectRepository projectRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<ChannelStatsResponse>> getStats(
            @PathVariable Long projectId,
            @PathVariable Long channelId,
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        User user = userService.getUserBySupabaseId(userDetails.getUserId());

        // Verify project belongs to user
        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Verify channel belongs to project
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new RuntimeException("Channel not found"));

        if (!channel.getProject().getId().equals(projectId)) {
            return ResponseEntity.notFound().build();
        }

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<ChannelStats> stats = channelStatsRepository
                .findByChannelIdAndRecordedAtBetweenOrderByRecordedAtAsc(channelId, since, LocalDateTime.now());

        List<ChannelStatsResponse> response = stats.stream()
                .map(ChannelStatsResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }
}
