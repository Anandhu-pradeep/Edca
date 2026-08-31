package com.arcade.backend.payment.controller;

import com.arcade.backend.common.dto.ApiResponse;
import com.arcade.backend.payment.dto.CreditBalanceResponse;
import com.arcade.backend.payment.dto.CreditTransactionDto;
import com.arcade.backend.payment.model.Wallet;
import com.arcade.backend.payment.repository.CreditTransactionRepository;
import com.arcade.backend.payment.service.CreditService;
import com.arcade.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/credits")
@RequiredArgsConstructor
public class CreditController {

    private final CreditService creditService;
    private final CreditTransactionRepository transactionRepository;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<CreditBalanceResponse>> getBalance(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        Wallet wallet = creditService.getOrCreateWallet(userDetails.getUser());
        
        CreditBalanceResponse response = CreditBalanceResponse.builder()
                .balance(wallet.getBalance())
                .totalPurchased(wallet.getTotalPurchased())
                .totalConsumed(wallet.getTotalConsumed())
                .build();

        return ResponseEntity.ok(
                ApiResponse.<CreditBalanceResponse>builder()
                        .status(HttpStatus.OK.value())
                        .code("BALANCE_RETRIEVED")
                        .message("Credit balance retrieved successfully.")
                        .data(response)
                        .path(servletRequest.getRequestURI())
                        .build());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ApiResponse.<Void>builder()
                        .status(HttpStatus.BAD_REQUEST.value())
                        .code("BAD_REQUEST")
                        .message(ex.getMessage())
                        .path(request.getRequestURI())
                        .build());
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<List<CreditTransactionDto>>> getTransactions(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest servletRequest) {

        List<CreditTransactionDto> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getUser().getId())
                .stream()
                .map(tx -> CreditTransactionDto.builder()
                        .id(tx.getId())
                        .type(tx.getType())
                        .credits(tx.getCredits())
                        .balanceAfter(tx.getBalanceAfter())
                        .description(tx.getDescription())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(
                ApiResponse.<List<CreditTransactionDto>>builder()
                        .status(HttpStatus.OK.value())
                        .code("TRANSACTIONS_RETRIEVED")
                        .message("Credit transactions retrieved successfully.")
                        .data(transactions)
                        .path(servletRequest.getRequestURI())
                        .build());
    }

    @PostMapping("/consume-interview")
    public ResponseEntity<ApiResponse<CreditBalanceResponse>> consumeInterviewCredits(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody com.arcade.backend.payment.dto.ConsumeInterviewRequest request,
            HttpServletRequest servletRequest) {

        creditService.consumeCreditsForInterview(userDetails.getUser(), request.getInterviewId());

        return getBalance(userDetails, servletRequest);
    }
}
