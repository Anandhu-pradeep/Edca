package com.arcade.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreditBalanceResponse {
    private Long balance;
    private Long totalPurchased;
    private Long totalConsumed;
}
