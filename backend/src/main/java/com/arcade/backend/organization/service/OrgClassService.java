package com.arcade.backend.organization.service;

import com.arcade.backend.organization.dto.ClassStudentDto;
import com.arcade.backend.organization.dto.CreateClassRequest;
import com.arcade.backend.organization.dto.OrgClassDto;
import com.arcade.backend.organization.entity.ClassMembership;
import com.arcade.backend.organization.entity.OrgClass;
import com.arcade.backend.organization.entity.Organization;
import com.arcade.backend.organization.repository.ClassMembershipRepository;
import com.arcade.backend.organization.repository.OrgClassRepository;
import com.arcade.backend.organization.repository.OrganizationRepository;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrgClassService {

    private final OrgClassRepository orgClassRepository;
    private final ClassMembershipRepository classMembershipRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final com.arcade.backend.organization.repository.OrganizationMemberRepository memberRepository;

    @Transactional
    public OrgClassDto createClass(UUID organizationId, CreateClassRequest request) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        OrgClass orgClass = OrgClass.builder()
                .organization(organization)
                .name(request.getName())
                .description(request.getDescription())
                .academicYear(request.getAcademicYear())
                .build();

        orgClass = orgClassRepository.save(orgClass);
        return mapToDto(orgClass, 0);
    }

    @Transactional(readOnly = true)
    public List<OrgClassDto> getOrganizationClasses(UUID organizationId) {
        List<OrgClass> classes = orgClassRepository.findByOrganizationId(organizationId);
        return classes.stream().map(c -> {
            int count = classMembershipRepository.findByOrgClassId(c.getId()).size();
            return mapToDto(c, count);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassStudentDto> getClassStudents(UUID classId) {
        return classMembershipRepository.findByOrgClassId(classId).stream()
                .map(cm -> ClassStudentDto.builder()
                        .membershipId(cm.getId())
                        .studentId(cm.getUser().getId())
                        .studentName(cm.getUser().getFirstName() + " " + (cm.getUser().getLastName() != null ? cm.getUser().getLastName() : ""))
                        .studentEmail(cm.getUser().getEmail())
                        .joinedAt(cm.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addStudentToClass(UUID classId, UUID studentId) {
        if (classMembershipRepository.existsByOrgClassIdAndUserId(classId, studentId)) {
            throw new IllegalArgumentException("Student is already in this class");
        }

        OrgClass orgClass = orgClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ClassMembership membership = ClassMembership.builder()
                .orgClass(orgClass)
                .user(student)
                .build();

        classMembershipRepository.save(membership);
    }

    @Transactional
    public void removeStudentFromClass(UUID classId, UUID studentId) {
        ClassMembership membership = classMembershipRepository.findByOrgClassId(classId).stream()
                .filter(cm -> cm.getUser().getId().equals(studentId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Membership not found"));

        classMembershipRepository.delete(membership);
    }

    private OrgClassDto mapToDto(OrgClass orgClass, int studentCount) {
        return OrgClassDto.builder()
                .id(orgClass.getId())
                .organizationId(orgClass.getOrganization().getId())
                .name(orgClass.getName())
                .description(orgClass.getDescription())
                .academicYear(orgClass.getAcademicYear())
                .studentCount(studentCount)
                .createdAt(orgClass.getCreatedAt())
                .build();
    }

    @Transactional
    public void joinClassViaLink(UUID organizationId, UUID classId, UUID studentId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        OrgClass orgClass = orgClassRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!memberRepository.existsByOrganizationIdAndUserId(organizationId, studentId)) {
            com.arcade.backend.organization.entity.OrganizationMember member = com.arcade.backend.organization.entity.OrganizationMember.builder()
                    .organization(organization)
                    .user(student)
                    .role(com.arcade.backend.organization.enums.OrgRoleType.STUDENT)
                    .isActive(true)
                    .build();
            memberRepository.save(member);
        }

        if (!classMembershipRepository.existsByOrgClassIdAndUserId(classId, studentId)) {
            ClassMembership membership = ClassMembership.builder()
                    .orgClass(orgClass)
                    .user(student)
                    .build();
            classMembershipRepository.save(membership);
        }
    }

    @Transactional(readOnly = true)
    public List<OrgClassDto> getMyEnrolledClasses(UUID organizationId, UUID studentId) {
        return classMembershipRepository.findByUserId(studentId).stream()
                .map(ClassMembership::getOrgClass)
                .filter(c -> c.getOrganization().getId().equals(organizationId))
                .map(c -> {
                    int count = classMembershipRepository.findByOrgClassId(c.getId()).size();
                    return mapToDto(c, count);
                })
                .collect(Collectors.toList());
    }
}
