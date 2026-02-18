package com.javanextboilerplate.repository;

import com.javanextboilerplate.entity.SeoAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeoAuditRepository extends JpaRepository<SeoAudit, Long> {

    Optional<SeoAudit> findTopByProjectIdOrderByAuditedAtDesc(Long projectId);
}
