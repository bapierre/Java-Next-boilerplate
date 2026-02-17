package com.javanextboilerplate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "linked_channels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "channel_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkedChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "channel_id", nullable = false)
    private Long channelId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
