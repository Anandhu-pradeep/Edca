package com.arcade.backend.payment.redeem.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RedeemCodeRedeemResponse {
    private boolean success;
    private String message;
    private Long creditsAdded;
}
