package com.javanextboilerplate.dto.response;

import com.javanextboilerplate.entity.SeoAudit;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SeoAuditResponse {

    private Long id;
    private String url;
    private LocalDateTime auditedAt;
    /** 0-100 weighted score (PASS=1pt, WARN=0.5pt, FAIL=0pt, INFO excluded) */
    private int score;
    private int passCount;
    private int warnCount;
    private int failCount;
    private List<SeoCheckItem> checks;

    public static SeoAuditResponse from(SeoAudit audit) {
        return SeoAuditResponse.builder()
                .id(audit.getId())
                .url(audit.getUrl())
                .auditedAt(audit.getAuditedAt())
                .score(audit.getScore())
                .passCount(audit.getPassCount())
                .warnCount(audit.getWarnCount())
                .failCount(audit.getFailCount())
                .checks(audit.getChecks())
                .build();
    }
}
