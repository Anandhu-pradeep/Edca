package com.arcade.backend.organization.service;

import com.arcade.backend.organization.dto.MyOrganizationDto;
import com.arcade.backend.organization.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationMemberRepository memberRepository;
    private final com.arcade.backend.user.UserRepository userRepository;
    private final com.arcade.backend.organization.repository.OrganizationRepository organizationRepository;
    private final com.arcade.backend.organization.repository.OrganizationInvitationRepository invitationRepository;
    private final com.arcade.backend.notification.service.NotificationService notificationService;
    private final com.arcade.backend.organization.repository.OrganizationCreditWalletRepository walletRepository;
    private final com.arcade.backend.organization.repository.OrganizationCreditTransactionRepository transactionRepository;

    public List<MyOrganizationDto> getMyOrganizations(UUID userId) {
        return memberRepository.findByUserId(userId).stream()
                .filter(member -> member.isActive())
                .map(member -> {
                    MyOrganizationDto dto = new MyOrganizationDto();
                    dto.setOrganizationId(member.getOrganization().getId());
                    dto.setName(member.getOrganization().getName());
                    dto.setType(member.getOrganization().getType());
                    dto.setRole(member.getRole());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<com.arcade.backend.organization.dto.OrgMemberDto> getOrganizationMembers(UUID organizationId) {
        return memberRepository.findByOrganizationId(organizationId).stream()
                .map(member -> com.arcade.backend.organization.dto.OrgMemberDto.builder()
                        .membershipId(member.getId())
                        .userId(member.getUser().getId())
                        .name(member.getUser().getFirstName() + " " + (member.getUser().getLastName() != null ? member.getUser().getLastName() : ""))
                        .email(member.getUser().getEmail())
                        .role(member.getRole())
                        .isActive(member.isActive())
                        .joinedAt(member.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void inviteMember(UUID organizationId, com.arcade.backend.organization.dto.InviteMemberRequest request) {
        String identifier = request.getEmail(); // The frontend field is named email but could be username
        com.arcade.backend.user.User user = userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                        .orElseThrow(() -> new IllegalArgumentException("User with this email or username not found.")));

        com.arcade.backend.organization.entity.Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        if (memberRepository.existsByOrganizationIdAndUserId(organizationId, user.getId())) {
            throw new IllegalArgumentException("User is already a member of this organization.");
        }

        if (invitationRepository.findByOrganizationIdAndUserIdAndStatus(organizationId, user.getId(), com.arcade.backend.organization.enums.InvitationStatus.PENDING).isPresent()) {
            throw new IllegalArgumentException("User already has a pending invitation.");
        }

        com.arcade.backend.organization.entity.OrganizationInvitation invitation = com.arcade.backend.organization.entity.OrganizationInvitation.builder()
                .organization(org)
                .user(user)
                .role(com.arcade.backend.organization.enums.OrgRoleType.valueOf(request.getRole() != null ? request.getRole() : "STUDENT"))
                .status(com.arcade.backend.organization.enums.InvitationStatus.PENDING)
                .build();

        invitationRepository.save(invitation);

        notificationService.createNotification(
                user.getId(),
                "Organization Invitation",
                "You have been invited to join " + org.getName() + " as a " + request.getRole() + ". Please review your pending invitations.",
                com.arcade.backend.notification.enums.NotificationType.ORG_INVITE,
                invitation.getId()
        );
    }

    @org.springframework.transaction.annotation.Transactional
    public void acceptInvitation(UUID invitationId, UUID userId) {
        com.arcade.backend.organization.entity.OrganizationInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found."));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to accept this invitation.");
        }

        if (invitation.getStatus() != com.arcade.backend.organization.enums.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is no longer pending.");
        }

        invitation.setStatus(com.arcade.backend.organization.enums.InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        com.arcade.backend.organization.entity.OrganizationMember member = com.arcade.backend.organization.entity.OrganizationMember.builder()
                .organization(invitation.getOrganization())
                .user(invitation.getUser())
                .role(invitation.getRole())
                .isActive(true)
                .build();

        memberRepository.save(member);
    }

    @org.springframework.transaction.annotation.Transactional
    public void rejectInvitation(UUID invitationId, UUID userId) {
        com.arcade.backend.organization.entity.OrganizationInvitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found."));

        if (!invitation.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to reject this invitation.");
        }

        if (invitation.getStatus() != com.arcade.backend.organization.enums.InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Invitation is no longer pending.");
        }

        invitation.setStatus(com.arcade.backend.organization.enums.InvitationStatus.REJECTED);
        invitationRepository.save(invitation);
    }

    public List<com.arcade.backend.organization.entity.Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteOrganization(UUID organizationId) {
        com.arcade.backend.organization.entity.Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));

        // Remove ROLE_ORGANIZATION from the owner
        if (org.getOwner() != null) {
            com.arcade.backend.user.User policyholder = userRepository.findById(org.getOwner().getId()).orElse(null);
            if (policyholder != null) {
                policyholder.getRoles().removeIf(role -> "ROLE_ORGANIZATION".equals(role.getName()));
                userRepository.save(policyholder);
            }
        }

        // Delete wallet and its transactions if they exist
        walletRepository.findByOrganizationId(organizationId).ifPresent(wallet -> {
            transactionRepository.deleteAll(transactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId()));
            walletRepository.delete(wallet);
        });

        // Delete all members, invitations, and the organization itself
        memberRepository.deleteAll(memberRepository.findByOrganizationId(organizationId));
        invitationRepository.deleteAll(invitationRepository.findByOrganizationId(organizationId));
        organizationRepository.delete(org);
    }

    @org.springframework.transaction.annotation.Transactional
    public void removeMember(UUID organizationId, UUID userId) {
        com.arcade.backend.organization.entity.Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found."));
        if (org.getOwner() != null && org.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("The organization owner cannot be removed.");
        }
        com.arcade.backend.organization.entity.OrganizationMember member = memberRepository.findByOrganizationIdAndUserId(organizationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found in organization."));
        memberRepository.delete(member);
    }

    @org.springframework.transaction.annotation.Transactional
    public void requestOrganizationDeletion(UUID organizationId, UUID requesterId) {
        com.arcade.backend.organization.entity.Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization not found."));
        
        if (org.getOwner() == null || !org.getOwner().getId().equals(requesterId)) {
            throw new IllegalArgumentException("Only the organization owner can request deletion.");
        }

        // Notify super admins
        java.util.List<com.arcade.backend.user.User> superAdmins = userRepository.findByRoles_Name("ROLE_SUPER_ADMIN");
        for (com.arcade.backend.user.User admin : superAdmins) {
            notificationService.createNotification(
                    admin.getId(),
                    "Organization Deletion Request",
                    "The organization owner of '" + org.getName() + "' has requested the deletion of their organization. Please go to the Audience section to delete it.",
                    com.arcade.backend.notification.enums.NotificationType.INFO,
                    organizationId
            );
        }
    }
}
