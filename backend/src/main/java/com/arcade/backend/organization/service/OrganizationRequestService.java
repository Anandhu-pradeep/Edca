package com.arcade.backend.organization.service;

import com.arcade.backend.organization.dto.OrganizationRequestCreateDto;
import com.arcade.backend.organization.dto.OrganizationRequestResponseDto;
import com.arcade.backend.organization.entity.Organization;
import com.arcade.backend.organization.entity.OrganizationMember;
import com.arcade.backend.organization.entity.OrganizationRequest;
import com.arcade.backend.organization.enums.OrgRoleType;
import com.arcade.backend.organization.enums.OrganizationStatus;
import com.arcade.backend.organization.enums.RequestStatus;
import com.arcade.backend.organization.repository.OrganizationMemberRepository;
import com.arcade.backend.organization.repository.OrganizationRepository;
import com.arcade.backend.organization.repository.OrganizationRequestRepository;
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
public class OrganizationRequestService {

    private final OrganizationRequestRepository requestRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final OrganizationCreditService creditService;

    @Transactional
    public OrganizationRequestResponseDto createRequest(UUID userId, OrganizationRequestCreateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (requestRepository.existsByRequesterIdAndStatus(userId, RequestStatus.PENDING)) {
            throw new RuntimeException("You already have a pending organization request");
        }

        OrganizationRequest request = OrganizationRequest.builder()
                .orgName(dto.getOrgName())
                .orgType(dto.getOrgType())
                .description(dto.getDescription())
                .officialEmail(dto.getOfficialEmail())
                .emailDomain(dto.getEmailDomain())
                .expectedStudents(dto.getExpectedStudents())
                .contactInfo(dto.getContactInfo())
                .reason(dto.getReason())
                .supportingInfo(dto.getSupportingInfo())
                .status(RequestStatus.PENDING)
                .requester(user)
                .build();

        requestRepository.save(request);
        return mapToDto(request);
    }

    public List<OrganizationRequestResponseDto> getPendingRequests() {
        return requestRepository.findByStatus(RequestStatus.PENDING)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<OrganizationRequestResponseDto> getUserRequests(UUID userId) {
        return requestRepository.findByRequesterId(userId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveRequest(UUID requestId) {
        OrganizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus(RequestStatus.APPROVED);
        requestRepository.save(request);

        // 1. Create Organization
        Organization org = Organization.builder()
                .name(request.getOrgName())
                .type(request.getOrgType())
                .description(request.getDescription())
                .officialEmail(request.getOfficialEmail())
                .emailDomain(request.getEmailDomain())
                .contactInfo(request.getContactInfo())
                .status(OrganizationStatus.ACTIVE)
                .owner(request.getRequester())
                .build();
        
        organizationRepository.save(org);

        // 2. Create Membership for Owner
        OrganizationMember member = OrganizationMember.builder()
                .organization(org)
                .user(request.getRequester())
                .role(OrgRoleType.OWNER)
                .isActive(true)
                .build();
        
        memberRepository.save(member);
        
        creditService.createWalletForOrganization(org);
    }

    @Transactional
    public void rejectRequest(UUID requestId) {
        OrganizationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Request is not pending");
        }

        request.setStatus(RequestStatus.REJECTED);
        requestRepository.save(request);
    }

    private OrganizationRequestResponseDto mapToDto(OrganizationRequest request) {
        OrganizationRequestResponseDto dto = new OrganizationRequestResponseDto();
        dto.setId(request.getId());
        dto.setOrgName(request.getOrgName());
        dto.setOrgType(request.getOrgType());
        dto.setDescription(request.getDescription());
        dto.setOfficialEmail(request.getOfficialEmail());
        dto.setEmailDomain(request.getEmailDomain());
        dto.setExpectedStudents(request.getExpectedStudents());
        dto.setContactInfo(request.getContactInfo());
        dto.setReason(request.getReason());
        dto.setSupportingInfo(request.getSupportingInfo());
        dto.setStatus(request.getStatus());
        dto.setRequesterId(request.getRequester().getId());
        dto.setRequesterName(request.getRequester().getFirstName() + " " + request.getRequester().getLastName());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
