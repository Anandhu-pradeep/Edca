package com.arcade.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentOrderResponse {
    private String orderId;
    private Long amount; // in paise
    private String currency;
    private Long credits;
}
