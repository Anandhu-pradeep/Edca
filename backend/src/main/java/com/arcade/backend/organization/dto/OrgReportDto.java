package com.arcade.backend.organization.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgReportDto {
    private long totalInterviews;
    private long completedInterviews;
    private String averageScore;
    private long activeStudents;
    private long creditsUsed;
    private List<ClassPerformanceDto> classPerformance;
    private List<RecentActivityDto> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassPerformanceDto {
        private UUID classId;
        private String className;
        private int studentCount;
        private int interviewsScheduled;
        private int interviewsCompleted;
        private String averageGrade;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDto {
        private String id;
        private String title;
        private String description;
        private ZonedDateTime timestamp;
        private String type;
    }
}
