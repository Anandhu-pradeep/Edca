package com.arcade.backend.payment.redeem.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
public class RedeemCodeCreateRequest {
    @NotNull
    @Min(1)
    private Long credits;

    private ZonedDateTime expiresAt;

    @Min(1)
    private Integer maxRedemptions;

    @Min(1)
    private Integer perUserLimit;
}
