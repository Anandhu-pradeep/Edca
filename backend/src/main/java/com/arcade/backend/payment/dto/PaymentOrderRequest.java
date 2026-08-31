package com.arcade.backend.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentOrderRequest {
    @NotNull
    @Min(1)
    private Long credits;
}
