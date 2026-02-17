package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.Channel;
import com.javanextboilerplate.entity.LinkedChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LinkedChannelRepository extends JpaRepository<LinkedChannel, Long> {

    List<LinkedChannel> findByProjectId(Long projectId);

    boolean existsByProjectIdAndChannelId(Long projectId, Long channelId);

    void deleteByProjectIdAndChannelId(Long projectId, Long channelId);

    /**
     * Fetch the actual Channel entities linked to a project, with project eagerly loaded.
     */
    @Query("SELECT c FROM Channel c JOIN FETCH c.project WHERE c.id IN (SELECT lc.channelId FROM LinkedChannel lc WHERE lc.projectId = :projectId)")
    List<Channel> findLinkedChannelsByProjectId(@Param("projectId") Long projectId);

    /**
     * Find all user's channels NOT already owned by or linked to a specific project.
     * JOIN FETCH c.project avoids N+1 lazy-load queries when building the response DTO.
     */
    @Query("SELECT c FROM Channel c JOIN FETCH c.project p " +
           "WHERE p.userId = :userId " +
           "AND p.id <> :projectId " +
           "AND c.id NOT IN (SELECT lc.channelId FROM LinkedChannel lc WHERE lc.projectId = :projectId)")
    List<Channel> findLinkableChannels(@Param("projectId") Long projectId, @Param("userId") Long userId);
}
