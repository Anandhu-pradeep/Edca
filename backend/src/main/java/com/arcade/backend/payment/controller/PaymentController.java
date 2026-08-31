package com.arcade.backend.payment.controller;

import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.payment.dto.PaymentOrderRequest;
import com.arcade.backend.payment.dto.PaymentOrderResponse;
import com.arcade.backend.payment.dto.PaymentVerificationRequest;
import com.arcade.backend.payment.service.PaymentService;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentOrderRequest request,
            HttpServletRequest servletRequest) {

        PaymentOrderResponse response = paymentService.createOrder(userDetails.getUser(), request);

        return ResponseEntity.ok(
                ApiResponse.<PaymentOrderResponse>builder()
                        .status(HttpStatus.OK.value())
                        .code("ORDER_CREATED")
                        .message("Razorpay order created successfully.")
                        .data(response)
                        .path(servletRequest.getRequestURI())
                        .build());
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentVerificationRequest request,
            HttpServletRequest servletRequest) {

        paymentService.verifyPayment(request);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.OK.value())
                        .code("PAYMENT_VERIFIED")
                        .message("Payment verified and credits added.")
                        .data(null)
                        .path(servletRequest.getRequestURI())
                        .build());
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<java.util.List<com.arcade.backend.payment.dto.PaymentDto>>> getPaymentHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        java.util.List<com.arcade.backend.payment.dto.PaymentDto> history = paymentService.getPaymentHistory(userDetails.getUser());

        return ResponseEntity.ok(
                ApiResponse.<java.util.List<com.arcade.backend.payment.dto.PaymentDto>>builder()
                        .status(HttpStatus.OK.value())
                        .code("PAYMENT_HISTORY_RETRIEVED")
                        .message("Payment history retrieved successfully.")
                        .data(history)
                        .path(servletRequest.getRequestURI())
                        .build());
    }
}
