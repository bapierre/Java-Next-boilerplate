package com.javanextboilerplate.service;

import com.javanextboilerplate.dto.response.AdminUserResponse;
import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.User;
import com.javanextboilerplate.repository.ChannelRepository;
import com.javanextboilerplate.repository.SaasProjectRepository;
import com.javanextboilerplate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final SaasProjectRepository projectRepository;
    private final ChannelRepository channelRepository;
    private final ChannelSyncService channelSyncService;

    public void assertAdmin(String supabaseUserId) {
        User user = userService.getUserBySupabaseId(supabaseUserId);
        if (!user.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    int projectCount = (int) projectRepository.countByUserId(user.getId());
                    int channelCount = (int) channelRepository.countChannelsByUserId(user.getId());
                    LocalDateTime lastSyncedAt = channelRepository
                            .findActiveChannelsByUserId(user.getId())
                            .stream()
                            .map(Channel::getLastSyncedAt)
                            .filter(t -> t != null)
                            .max(Comparator.naturalOrder())
                            .orElse(null);
                    return AdminUserResponse.from(user, projectCount, channelCount, lastSyncedAt);
                })
                .toList();
    }

    @Async
    public void triggerGlobalSync() {
        log.info("Admin triggered global sync");
        channelSyncService.syncAllChannels();
    }

    @Async
    public void triggerUserSync(Long userId) {
        log.info("Admin triggered sync for user {}", userId);
        List<Channel> channels = channelRepository.findActiveChannelsByUserId(userId);
        log.info("Found {} active channels for user {}", channels.size(), userId);
        for (Channel channel : channels) {
            try {
                channelSyncService.syncChannel(channel);
            } catch (Exception e) {
                log.warn("Failed to sync channel {} for user {}: {}", channel.getId(), userId, e.getMessage());
            }
        }
    }

    @Transactional
    public void setAdmin(Long userId, boolean isAdmin) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setAdmin(isAdmin);
        userRepository.save(user);
        log.info("Set isAdmin={} for user {}", isAdmin, userId);
    }
}
