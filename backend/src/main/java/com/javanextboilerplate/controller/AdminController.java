package com.javanextboilerplate.controller;

import com.javanextboilerplate.dto.response.AdminUserResponse;
import com.javanextboilerplate.security.SupabaseUserDetails;
import com.javanextboilerplate.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        adminService.assertAdmin(userDetails.getUserId());
        return ResponseEntity.ok(Map.of("isAdmin", true));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers(
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        adminService.assertAdmin(userDetails.getUserId());
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> syncAll(
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        adminService.assertAdmin(userDetails.getUserId());
        adminService.triggerGlobalSync();
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/users/{userId}/sync")
    public ResponseEntity<Void> syncUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        adminService.assertAdmin(userDetails.getUserId());
        adminService.triggerUserSync(userId);
        return ResponseEntity.accepted().build();
    }

    @PatchMapping("/users/{userId}/admin")
    public ResponseEntity<Void> setAdmin(
            @PathVariable Long userId,
            @RequestBody Map<String, Boolean> body,
            @AuthenticationPrincipal SupabaseUserDetails userDetails
    ) {
        adminService.assertAdmin(userDetails.getUserId());
        Boolean isAdmin = body.get("isAdmin");
        if (isAdmin == null) {
            return ResponseEntity.badRequest().build();
        }
        adminService.setAdmin(userId, isAdmin);
        return ResponseEntity.ok().build();
    }
}
