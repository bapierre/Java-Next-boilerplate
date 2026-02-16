package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.response.PostResponse;
import com.javanextboilerplate.entity.Post;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.PostRepository;
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
@RequestMapping("/api/projects/{projectId}/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostRepository postRepository;
    private final SaasProjectRepository projectRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<PostResponse>> getPosts(
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "30") int days,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        User user = userService.getUserBySupabaseId(userDetails.getUserId());

        projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Post> posts = postRepository.findByProjectIdAndPublishedAfter(projectId, since);

        List<PostResponse> response = posts.stream()
                .map(PostResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }
}
