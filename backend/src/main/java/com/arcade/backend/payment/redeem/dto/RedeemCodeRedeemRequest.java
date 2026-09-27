package com.arcade.backend.payment.redeem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RedeemCodeRedeemRequest {
    @NotBlank
    private String code;
}
