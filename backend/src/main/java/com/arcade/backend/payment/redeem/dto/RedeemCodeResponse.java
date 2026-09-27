package com.arcade.backend.payment.redeem.dto;

import com.arcade.backend.payment.redeem.RedeemCodeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class RedeemCodeResponse {
    private UUID id;
    private String code; // Only populated on creation
    private Long credits;
    private ZonedDateTime expiresAt;
    private Integer maxRedemptions;
    private Integer redemptionCount;
    private Integer perUserLimit;
    private RedeemCodeStatus status;
    private ZonedDateTime createdAt;
    private UUID createdBy;
}
