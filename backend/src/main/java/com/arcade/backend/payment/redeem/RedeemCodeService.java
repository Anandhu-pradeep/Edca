package com.arcade.backend.payment.redeem;

import com.arcade.backend.common.exception.ResourceNotFoundException;
import com.arcade.backend.payment.model.TransactionType;
import com.arcade.backend.payment.service.CreditService;
import com.arcade.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RedeemCodeService {

    private final RedeemCodeRepository redeemCodeRepository;
    private final RedeemCodeRedemptionRepository redemptionRepository;
    private final CreditService creditService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String ALLOWED_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluded O, 0, I, 1

    @Transactional
    public String generateRedeemCode(Long credits, ZonedDateTime expiresAt, Integer maxRedemptions, Integer perUserLimit, User creator) {
        String plaintextCode = generateRandomCode(16);
        String codeHash = hash(plaintextCode);

        RedeemCode redeemCode = RedeemCode.builder()
                .codeHash(codeHash)
                .credits(credits)
                .expiresAt(expiresAt)
                .maxRedemptions(maxRedemptions)
                .perUserLimit(perUserLimit != null ? perUserLimit : 1)
                .status(RedeemCodeStatus.ACTIVE)
                .createdBy(creator.getId())
                .build();

        redeemCodeRepository.save(redeemCode);
        return plaintextCode;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Long redeemCode(String plaintextCode, User user) {
        String codeHash = hash(plaintextCode);
        RedeemCode redeemCode = redeemCodeRepository.findByCodeHash(codeHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or unavailable redeem code."));

        if (redeemCode.getStatus() != RedeemCodeStatus.ACTIVE) {
            throw new IllegalArgumentException("Invalid or unavailable redeem code.");
        }

        if (redeemCode.getExpiresAt() != null && ZonedDateTime.now().isAfter(redeemCode.getExpiresAt())) {
            redeemCode.setStatus(RedeemCodeStatus.EXPIRED);
            redeemCodeRepository.save(redeemCode);
            throw new IllegalArgumentException("Invalid or unavailable redeem code.");
        }

        if (redeemCode.getMaxRedemptions() != null && redeemCode.getRedemptionCount() >= redeemCode.getMaxRedemptions()) {
            redeemCode.setStatus(RedeemCodeStatus.EXHAUSTED);
            redeemCodeRepository.save(redeemCode);
            throw new IllegalArgumentException("Invalid or unavailable redeem code.");
        }

        int userRedemptions = redemptionRepository.countByRedeemCodeIdAndUserId(redeemCode.getId(), user.getId());
        if (userRedemptions >= redeemCode.getPerUserLimit()) {
            throw new IllegalArgumentException("You have already reached the redemption limit for this code.");
        }

        // Add credits
        creditService.addCredits(user, redeemCode.getCredits(), redeemCode.getId(), "Redeem Code", TransactionType.REDEEM_CODE);

        // Record redemption
        RedeemCodeRedemption redemption = RedeemCodeRedemption.builder()
                .redeemCode(redeemCode)
                .user(user)
                .creditsGranted(redeemCode.getCredits())
                .build();
        redemptionRepository.save(redemption);

        // Update code stats
        redeemCode.setRedemptionCount(redeemCode.getRedemptionCount() + 1);
        if (redeemCode.getMaxRedemptions() != null && redeemCode.getRedemptionCount() >= redeemCode.getMaxRedemptions()) {
            redeemCode.setStatus(RedeemCodeStatus.EXHAUSTED);
        }
        redeemCodeRepository.save(redeemCode);

        return redeemCode.getCredits();
    }

    @Transactional(readOnly = true)
    public List<RedeemCode> listRedeemCodes() {
        return redeemCodeRepository.findAll(); // Should have pagination in a real app, but ok for now
    }
    
    @Transactional(readOnly = true)
    public RedeemCode getRedeemCode(UUID id) {
        return redeemCodeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("RedeemCode not found with id: " + id));
    }

    @Transactional
    public RedeemCode disableRedeemCode(UUID id) {
        RedeemCode code = getRedeemCode(id);
        code.setStatus(RedeemCodeStatus.DISABLED);
        return redeemCodeRepository.save(code);
    }
    
    @Transactional(readOnly = true)
    public List<RedeemCodeRedemption> getRedemptions(UUID codeId) {
        return redemptionRepository.findByRedeemCodeId(codeId);
    }

    private String generateRandomCode(int length) {
        return IntStream.range(0, length)
                .map(i -> ALLOWED_CHARS.charAt(RANDOM.nextInt(ALLOWED_CHARS.length())))
                .mapToObj(c -> String.valueOf((char) c))
                .collect(Collectors.joining());
    }

    private String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
