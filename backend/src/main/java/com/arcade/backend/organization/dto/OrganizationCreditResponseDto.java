package com.arcade.backend.organization.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;
import java.time.ZonedDateTime;

@Data
@Builder
public class OrganizationCreditResponseDto {
    private UUID organizationId;
    private int balance;
    private int reservedBalance;
    private List<TransactionDto> recentTransactions;

    @Data
    @Builder
    public static class TransactionDto {
        private UUID id;
        private int amount;
        private String transactionType;
        private String description;
        private ZonedDateTime createdAt;
    }
}
