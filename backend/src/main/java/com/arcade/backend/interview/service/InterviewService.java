package com.arcade.backend.interview.service;

import com.arcade.backend.common.exception.ResourceNotFoundException;
import com.arcade.backend.interview.dto.DashboardStatsDto;
import com.arcade.backend.interview.dto.InterviewDto;
import com.arcade.backend.interview.dto.InterviewRequest;
import com.arcade.backend.interview.entity.Interview;
import com.arcade.backend.interview.repository.InterviewRepository;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final com.arcade.backend.organization.repository.OrganizationInterviewAssignmentRepository assignmentRepository;

    public UserRepository getUserRepository() {
        return userRepository;
    }

    @Transactional
    public InterviewDto createInterview(UUID userId, InterviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Interview interview = Interview.builder()
                .interviewee(user)
                .role(request.getRole())
                .scheduledAt(request.getScheduledAt() != null ? request.getScheduledAt() : ZonedDateTime.now())
                .status("SCHEDULED")
                .build();

        Interview saved = interviewRepository.save(interview);
        return mapToDto(saved);
    }

    @Transactional
    public InterviewDto completeInterview(UUID id, String grade, String feedback, Integer durationMinutes) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
        
        interview.setStatus("COMPLETED");
        interview.setEndedAt(ZonedDateTime.now());
        interview.setGrade(grade);
        interview.setFeedback(feedback);
        interview.setDurationMinutes(durationMinutes);
        
        return mapToDto(interviewRepository.save(interview));
    }

    @Transactional(readOnly = true)
    public InterviewDto getInterviewByRoomId(String roomId) {
        Interview interview = interviewRepository.findByRoomId(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with roomId: " + roomId));
        return mapToDto(interview);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(UUID userId) {
        List<Interview> interviews = interviewRepository.findByIntervieweeIdOrderByCreatedAtDesc(userId);
        
        int interviewsTaken = (int) interviews.stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()))
                .count();

        String avgGrade = calculateAvgGrade(interviews);
        List<InterviewDto> recent = interviews.stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        List<Map<String, Object>> perfData = generatePerformanceData(interviews);

        return DashboardStatsDto.builder()
                .interviewsTaken(interviewsTaken)
                .avgGrade(avgGrade)
                .activeJobs(5) // Mock static active jobs for now as requested
                .currentPlan("Pro")
                .recentInterviews(recent)
                .performanceData(perfData)
                .build();
    }

    private String calculateAvgGrade(List<Interview> interviews) {
        List<String> grades = interviews.stream()
                .map(Interview::getGrade)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        
        if (grades.isEmpty()) return "N/A";
        
        // Simple mock average calculation
        double total = 0;
        for (String g : grades) {
            total += gradeToScore(g);
        }
        return scoreToGrade(total / grades.size());
    }

    private double gradeToScore(String grade) {
        return switch (grade.toUpperCase()) {
            case "A+" -> 100;
            case "A" -> 95;
            case "A-" -> 90;
            case "B+" -> 85;
            case "B" -> 80;
            case "B-" -> 75;
            case "C+" -> 70;
            case "C" -> 65;
            case "F" -> 50;
            default -> 80; // Default
        };
    }

    private String scoreToGrade(double score) {
        if (score >= 97) return "A+";
        if (score >= 93) return "A";
        if (score >= 90) return "A-";
        if (score >= 87) return "B+";
        if (score >= 83) return "B";
        if (score >= 80) return "B-";
        if (score >= 77) return "C+";
        if (score >= 70) return "C";
        return "F";
    }

    private List<Map<String, Object>> generatePerformanceData(List<Interview> interviews) {
        List<Map<String, Object>> perfData = new ArrayList<>();
        // Mock standard progression if empty
        if (interviews.isEmpty()) {
            perfData.add(Map.of("name", "Jan", "score", 65));
            perfData.add(Map.of("name", "Feb", "score", 72));
            perfData.add(Map.of("name", "Mar", "score", 68));
            perfData.add(Map.of("name", "Apr", "score", 85));
            perfData.add(Map.of("name", "May", "score", 82));
            perfData.add(Map.of("name", "Jun", "score", 90));
            return perfData;
        }

        // Just map up to 6 completed interviews to the chart
        List<Interview> completed = interviews.stream()
                .filter(i -> "COMPLETED".equals(i.getStatus()) && i.getGrade() != null && i.getEndedAt() != null)
                .sorted(Comparator.comparing(Interview::getEndedAt))
                .collect(Collectors.toList());

        for (int i = 0; i < completed.size() && i < 6; i++) {
            Interview inter = completed.get(i);
            Map<String, Object> point = new HashMap<>();
            String month = inter.getEndedAt().getMonth().name().substring(0, 3);
            point.put("name", month + " " + inter.getEndedAt().getDayOfMonth());
            point.put("score", gradeToScore(inter.getGrade()));
            perfData.add(point);
        }

        if (perfData.isEmpty()) {
             perfData.add(Map.of("name", "Now", "score", 0));
        }

        return perfData;
    }

    private InterviewDto mapToDto(Interview interview) {
        return InterviewDto.builder()
                .id(interview.getId())
                .roomId(interview.getRoomId())
                .interviewerId(interview.getInterviewer() != null ? interview.getInterviewer().getId() : null)
                .intervieweeId(interview.getInterviewee() != null ? interview.getInterviewee().getId() : null)
                .role(interview.getRole())
                .scheduledAt(interview.getScheduledAt())
                .startedAt(interview.getStartedAt())
                .endedAt(interview.getEndedAt())
                .durationMinutes(interview.getDurationMinutes())
                .status(interview.getStatus())
                .grade(interview.getGrade())
                .feedback(interview.getFeedback())
                .isOrgInterview(assignmentRepository.existsByInterviewId(interview.getId()))
                .createdAt(interview.getCreatedAt())
                .build();
    }
}
