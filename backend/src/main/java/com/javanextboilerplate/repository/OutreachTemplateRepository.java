package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.OutreachTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OutreachTemplateRepository extends JpaRepository<OutreachTemplate, Long> {

    List<OutreachTemplate> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    Optional<OutreachTemplate> findByIdAndProjectId(Long id, Long projectId);
}
