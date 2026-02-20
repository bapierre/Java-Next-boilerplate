package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.User;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        String name,
        boolean isAdmin,
        LocalDateTime createdAt,
        int projectCount,
        int channelCount,
        LocalDateTime lastSyncedAt
) {
    public static AdminUserResponse from(User user, int projectCount, int channelCount, LocalDateTime lastSyncedAt) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.isAdmin(),
                user.getCreatedAt(),
                projectCount,
                channelCount,
                lastSyncedAt
        );
    }
}
