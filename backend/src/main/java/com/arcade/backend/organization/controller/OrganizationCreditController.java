package com.arcade.backend.organization.controller;

import com.arcade.backend.organization.dto.OrganizationCreditResponseDto;
import com.arcade.backend.organization.service.OrganizationCreditService;
import com.arcade.backend.payment.dto.PaymentOrderRequest;
import com.arcade.backend.payment.dto.PaymentOrderResponse;
import com.arcade.backend.payment.dto.PaymentVerificationRequest;
import com.arcade.backend.payment.service.PaymentService;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/credits")
@RequiredArgsConstructor
public class OrganizationCreditController {

    private final OrganizationCreditService creditService;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<OrganizationCreditResponseDto> getWalletStatus(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(creditService.getWalletStatus(organizationId));
    }

    @PostMapping("/purchase")
    // Removed SUPER_ADMIN restriction to allow org heads to purchase
    public ResponseEntity<Void> addCredits(
            @PathVariable UUID organizationId,
            @RequestParam int amount,
            @RequestParam(required = false, defaultValue = "Admin Purchase") String description) {
        creditService.addCredits(organizationId, amount, description);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/purchase/create-order")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createOrder(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentOrderRequest request,
            HttpServletRequest servletRequest) {

        PaymentOrderResponse response = paymentService.createOrganizationOrder(userDetails.getUser(), organizationId, request);

        return ResponseEntity.ok(
                ApiResponse.<PaymentOrderResponse>builder()
                        .status(HttpStatus.OK.value())
                        .code("ORDER_CREATED")
                        .message("Razorpay order created successfully.")
                        .data(response)
                        .path(servletRequest.getRequestURI())
                        .build());
    }

    @PostMapping("/purchase/verify")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(
            @PathVariable UUID organizationId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody PaymentVerificationRequest request,
            HttpServletRequest servletRequest) {

        paymentService.verifyOrganizationPayment(organizationId, request);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.OK.value())
                        .code("PAYMENT_VERIFIED")
                        .message("Payment verified and credits added.")
                        .data(null)
                        .path(servletRequest.getRequestURI())
                        .build());
    }
}
