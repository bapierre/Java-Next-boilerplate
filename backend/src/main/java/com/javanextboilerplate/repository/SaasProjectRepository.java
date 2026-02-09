package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.SaasProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaasProjectRepository extends JpaRepository<SaasProject, Long> {

    /**
     * Find all projects for a specific user
     */
    List<SaasProject> findByUserId(Long userId);

    /**
     * Find a project by ID and user ID (for authorization)
     */
    Optional<SaasProject> findByIdAndUserId(Long id, Long userId);

    /**
     * Check if a user has any projects
     */
    boolean existsByUserId(Long userId);

    /**
     * Count projects for a user
     */
    long countByUserId(Long userId);

    /**
     * Find projects with channels
     */
    @Query("SELECT DISTINCT p FROM SaasProject p LEFT JOIN FETCH p.channels WHERE p.userId = :userId")
    List<SaasProject> findByUserIdWithChannels(Long userId);
}
