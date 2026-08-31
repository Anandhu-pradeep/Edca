package com.arcade.backend.payment.dto;

import com.arcade.backend.payment.model.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentDto {
    private UUID id;
    private String razorpayOrderId;
    private Long amount;
    private String currency;
    private Long credits;
    private PaymentStatus status;
    private ZonedDateTime createdAt;
}
