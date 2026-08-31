package com.arcade.backend.payment.dto;

import com.arcade.backend.payment.model.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class CreditTransactionDto {
    private UUID id;
    private TransactionType type;
    private Long credits;
    private Long balanceAfter;
    private String description;
    private ZonedDateTime createdAt;
}
