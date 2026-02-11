package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {

    /**
     * Find all channels for a project
     */
    List<Channel> findByProjectId(Long projectId);

    /**
     * Find channels by platform
     */
    List<Channel> findByProjectIdAndPlatform(Long projectId, Platform platform);

    /**
     * Find active channels
     */
    List<Channel> findByProjectIdAndIsActiveTrue(Long projectId);

    /**
     * Find a specific channel
     */
    Optional<Channel> findByProjectIdAndPlatformAndChannelId(Long projectId, Platform platform, String channelId);

    /**
     * Find channels that need syncing (haven't been synced recently)
     */
    @Query("SELECT c FROM Channel c WHERE c.isActive = true AND (c.lastSyncedAt IS NULL OR c.lastSyncedAt < :threshold)")
    List<Channel> findChannelsNeedingSync(LocalDateTime threshold);

    /**
     * Find channels with expired tokens
     */
    @Query("SELECT c FROM Channel c WHERE c.isActive = true AND c.tokenExpiresAt < :now")
    List<Channel> findChannelsWithExpiredTokens(LocalDateTime now);

    /**
     * Count active channels by platform for a project
     */
    long countByProjectIdAndPlatformAndIsActiveTrue(Long projectId, Platform platform);

    /**
     * Find all active channels across all projects (for scheduled sync)
     */
    List<Channel> findByIsActiveTrue();
}
