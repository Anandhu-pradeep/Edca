package com.arcade.backend.payment.redeem;

import com.arcade.backend.payment.redeem.dto.RedeemCodeCreateRequest;
import com.arcade.backend.payment.redeem.dto.RedeemCodeRedeemRequest;
import com.arcade.backend.payment.redeem.dto.RedeemCodeRedeemResponse;
import com.arcade.backend.payment.redeem.dto.RedeemCodeResponse;
import com.arcade.backend.security.CustomUserDetails;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/redeem-codes")
@RequiredArgsConstructor
public class RedeemCodeController {

    private final RedeemCodeService redeemCodeService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('redeem_code:create')")
    public ResponseEntity<RedeemCodeResponse> createRedeemCode(
            @Valid @RequestBody RedeemCodeCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        User creator = userRepository.findById(userDetails.getId()).orElseThrow();
        String plaintextCode = redeemCodeService.generateRedeemCode(
                request.getCredits(),
                request.getExpiresAt(),
                request.getMaxRedemptions(),
                request.getPerUserLimit(),
                creator
        );

        RedeemCodeResponse response = RedeemCodeResponse.builder()
                .code(plaintextCode)
                .credits(request.getCredits())
                .expiresAt(request.getExpiresAt())
                .maxRedemptions(request.getMaxRedemptions())
                .perUserLimit(request.getPerUserLimit() != null ? request.getPerUserLimit() : 1)
                .status(RedeemCodeStatus.ACTIVE)
                .build();

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('redeem_code:view')")
    public ResponseEntity<List<RedeemCodeResponse>> listRedeemCodes() {
        List<RedeemCodeResponse> codes = redeemCodeService.listRedeemCodes().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(codes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('redeem_code:view')")
    public ResponseEntity<RedeemCodeResponse> getRedeemCode(@PathVariable UUID id) {
        RedeemCode code = redeemCodeService.getRedeemCode(id);
        return ResponseEntity.ok(mapToResponse(code));
    }

    @PatchMapping("/{id}/disable")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('redeem_code:disable')")
    public ResponseEntity<RedeemCodeResponse> disableRedeemCode(@PathVariable UUID id) {
        RedeemCode code = redeemCodeService.disableRedeemCode(id);
        return ResponseEntity.ok(mapToResponse(code));
    }

    @GetMapping("/{id}/redemptions")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasAuthority('redeem_code:view_redemptions')")
    public ResponseEntity<List<RedeemCodeRedemption>> getRedemptions(@PathVariable UUID id) {
        return ResponseEntity.ok(redeemCodeService.getRedemptions(id));
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeemCode(
            @Valid @RequestBody RedeemCodeRedeemRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            User user = userRepository.findById(userDetails.getId()).orElseThrow();
            Long creditsAdded = redeemCodeService.redeemCode(request.getCode(), user);
            
            RedeemCodeRedeemResponse response = RedeemCodeRedeemResponse.builder()
                    .success(true)
                    .message("Credits redeemed successfully.")
                    .creditsAdded(creditsAdded)
                    .build();
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                RedeemCodeRedeemResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build()
            );
        }
    }

    private RedeemCodeResponse mapToResponse(RedeemCode code) {
        return RedeemCodeResponse.builder()
                .id(code.getId())
                .credits(code.getCredits())
                .expiresAt(code.getExpiresAt())
                .maxRedemptions(code.getMaxRedemptions())
                .redemptionCount(code.getRedemptionCount())
                .perUserLimit(code.getPerUserLimit())
                .status(code.getStatus())
                .createdAt(code.getCreatedAt())
                .createdBy(code.getCreatedBy())
                .build();
    }
}
