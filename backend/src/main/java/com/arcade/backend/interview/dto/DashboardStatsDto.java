package com.arcade.backend.interview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private int interviewsTaken;
    private String avgGrade;
    private int activeJobs;
    private String currentPlan;
    private List<InterviewDto> recentInterviews;
    private List<Map<String, Object>> performanceData;
}
