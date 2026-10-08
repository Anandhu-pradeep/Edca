package com.arcade.backend.organization.service;

import com.arcade.backend.interview.entity.Interview;
import com.arcade.backend.interview.repository.InterviewRepository;
import com.arcade.backend.organization.entity.ClassMembership;
import com.arcade.backend.organization.entity.OrgClass;
import com.arcade.backend.organization.entity.Organization;
import com.arcade.backend.organization.entity.OrganizationInterviewAssignment;
import com.arcade.backend.organization.repository.ClassMembershipRepository;
import com.arcade.backend.organization.repository.OrgClassRepository;
import com.arcade.backend.organization.repository.OrganizationInterviewAssignmentRepository;
import com.arcade.backend.organization.repository.OrganizationRepository;
import com.arcade.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
public class OrgInterviewService {

    private final OrganizationRepository organizationRepository;
    private final OrgClassRepository orgClassRepository;
    private final ClassMembershipRepository classMembershipRepository;
    private final InterviewRepository interviewRepository;
    private final OrganizationInterviewAssignmentRepository assignmentRepository;
    private final OrganizationCreditService creditService;

    @Transactional
    public void scheduleClassInterviews(UUID organizationId, UUID classId, String role, ZonedDateTime scheduledAt, User interviewer) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        OrgClass orgClass = orgClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        List<ClassMembership> students = classMembershipRepository.findByOrgClassId(classId);
        if (students.isEmpty()) {
            throw new IllegalArgumentException("Class has no students");
        }

        int totalCreditsNeeded = students.size() * 5; // 5 credits per interview
        
        // Deduct credits from org wallet
        creditService.consumeCredits(organizationId, totalCreditsNeeded, "Scheduled interviews for class: " + orgClass.getName());

        for (ClassMembership student : students) {
            // Create the interview
            Interview interview = Interview.builder()
                    .roomId(UUID.randomUUID().toString())
                    .interviewer(interviewer)
                    .interviewee(student.getUser())
                    .role(role)
                    .status("SCHEDULED")
                    .scheduledAt(scheduledAt != null ? scheduledAt : ZonedDateTime.now())
                    .build();
            
            interview = interviewRepository.save(interview);

            // Link the interview to the organization
            OrganizationInterviewAssignment assignment = OrganizationInterviewAssignment.builder()
                    .organization(organization)
                    .orgClass(orgClass)
                    .interview(interview)
                    .creditCost(5)
                    .build();

            assignmentRepository.save(assignment);
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<com.arcade.backend.organization.dto.StudentAssignedInterviewDto> getMyAssignedInterviews(UUID organizationId, UUID studentId) {
        return assignmentRepository.findByOrganizationId(organizationId).stream()
                .filter(a -> a.getInterview().getInterviewee().getId().equals(studentId))
                .map(a -> com.arcade.backend.organization.dto.StudentAssignedInterviewDto.builder()
                        .assignmentId(a.getId())
                        .interviewId(a.getInterview().getId())
                        .roomId(a.getInterview().getRoomId())
                        .role(a.getInterview().getRole())
                        .className(a.getOrgClass() != null ? a.getOrgClass().getName() : "General")
                        .status(a.getInterview().getStatus())
                        .scheduledAt(a.getInterview().getScheduledAt())
                        .grade(a.getInterview().getGrade())
                        .durationMinutes(a.getInterview().getDurationMinutes())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
