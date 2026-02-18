package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.ColdOutreach;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ColdOutreachRepository extends JpaRepository<ColdOutreach, Long> {

    List<ColdOutreach> findByProjectIdOrderByContactedAtDesc(Long projectId, Pageable pageable);

    Optional<ColdOutreach> findByIdAndProjectId(Long id, Long projectId);

    boolean existsByProjectIdAndPlatformIgnoreCaseAndHandleIgnoreCase(Long projectId, String platform, String handle);
}
