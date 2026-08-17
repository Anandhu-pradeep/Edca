package com.arcade.backend.interview.repository;

import com.arcade.backend.interview.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, UUID> {
    List<Interview> findByIntervieweeIdOrderByCreatedAtDesc(UUID intervieweeId);
    List<Interview> findByInterviewerIdOrderByCreatedAtDesc(UUID interviewerId);
}
