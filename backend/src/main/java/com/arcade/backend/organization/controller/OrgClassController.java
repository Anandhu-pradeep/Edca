package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.dto.ClassStudentDto;
import com.arcade.backend.organization.dto.CreateClassRequest;
import com.arcade.backend.organization.dto.OrgClassDto;
import com.arcade.backend.organization.service.OrgClassService;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/classes")
@RequiredArgsConstructor
public class OrgClassController {

    private final OrgClassService orgClassService;
    private final com.arcade.backend.organization.service.OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<OrgClassDto> createClass(
            @PathVariable UUID organizationId,
            @Valid @RequestBody CreateClassRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgAdmin(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgClassService.createClass(organizationId, request));
    }

    @GetMapping
    public ResponseEntity<List<OrgClassDto>> getClasses(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgMember(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgClassService.getOrganizationClasses(organizationId));
    }

    @GetMapping("/my-enrolled")
    public ResponseEntity<List<OrgClassDto>> getMyEnrolledClasses(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgMember(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgClassService.getMyEnrolledClasses(organizationId, userDetails.getId()));
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<List<ClassStudentDto>> getClassStudents(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgMember(organizationId, userDetails.getId());
        return ResponseEntity.ok(orgClassService.getClassStudents(classId));
    }

    @PostMapping("/{classId}/students/{studentId}")
    public ResponseEntity<Void> addStudentToClass(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @PathVariable UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgAdmin(organizationId, userDetails.getId());
        orgClassService.addStudentToClass(classId, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<Void> removeStudentFromClass(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @PathVariable UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        organizationService.validateOrgAdmin(organizationId, userDetails.getId());
        orgClassService.removeStudentFromClass(classId, studentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{classId}/join-via-link")
    public ResponseEntity<Void> joinViaLink(
            @PathVariable UUID organizationId,
            @PathVariable UUID classId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        orgClassService.joinClassViaLink(organizationId, classId, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
