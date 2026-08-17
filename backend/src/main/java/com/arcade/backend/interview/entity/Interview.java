package com.arcade.backend.interview.entity;

import com.arcade.backend.common.entity.BaseEntity;
import com.arcade.backend.user.User;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview extends BaseEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "room_id")
  private String roomId;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "interviewer_id")
  private User interviewer;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "interviewee_id", nullable = false)
  private User interviewee;

  @Column(name = "role")
  private String role;

  @Column(name = "scheduled_at")
  private ZonedDateTime scheduledAt;

  @Column(name = "started_at")
  private ZonedDateTime startedAt;

  @Column(name = "ended_at")
  private ZonedDateTime endedAt;

  @Column(name = "duration_minutes")
  private Integer durationMinutes;

  @Column(name = "status", nullable = false)
  @Builder.Default
  private String status = "SCHEDULED";

  @Column(name = "grade")
  private String grade;

  @Column(name = "feedback", columnDefinition = "TEXT")
  private String feedback;
}
