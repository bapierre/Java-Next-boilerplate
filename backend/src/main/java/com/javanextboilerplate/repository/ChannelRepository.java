package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.Platform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Get follower counts grouped by platform for a project
     */
    @Query("SELECT c.platform, c.followerCount " +
           "FROM Channel c " +
           "WHERE c.project.id = :projectId AND c.isActive = true AND c.followerCount IS NOT NULL")
    List<Object[]> getFollowersByPlatform(@Param("projectId") Long projectId);

    /**
     * Get follower counts grouped by platform for a set of channel IDs (owned + linked)
     */
    @Query("SELECT c.platform, c.followerCount " +
           "FROM Channel c " +
           "WHERE c.id IN :channelIds AND c.isActive = true AND c.followerCount IS NOT NULL")
    List<Object[]> getFollowersByChannelIds(@Param("channelIds") List<Long> channelIds);
}
