package com.arcade.backend.payment.service;

import com.arcade.backend.payment.model.CreditTransaction;
import com.arcade.backend.payment.model.TransactionType;
import com.arcade.backend.payment.model.Wallet;
import com.arcade.backend.payment.repository.CreditTransactionRepository;
import com.arcade.backend.payment.repository.WalletRepository;
import com.arcade.backend.user.User;
import com.arcade.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final WalletRepository walletRepository;
    private final CreditTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId()).orElseGet(() -> {
            User managedUser = userRepository.findById(user.getId()).orElse(user);
            Wallet wallet = Wallet.builder()
                    .user(managedUser)
                    .balance(0L)
                    .totalPurchased(0L)
                    .totalConsumed(0L)
                    .build();
            return walletRepository.save(wallet);
        });
    }

    @Transactional
    public void addCredits(User user, Long credits, UUID referenceId, String description) {
        Wallet wallet = getOrCreateWallet(user);
        wallet.setBalance(wallet.getBalance() + credits);
        wallet.setTotalPurchased(wallet.getTotalPurchased() + credits);
        walletRepository.save(wallet);

        CreditTransaction transaction = CreditTransaction.builder()
                .user(user)
                .type(TransactionType.PURCHASE)
                .credits(credits)
                .balanceAfter(wallet.getBalance())
                .referenceId(referenceId)
                .description(description)
                .build();
        transactionRepository.save(transaction);
    }

    @Transactional
    public boolean consumeCreditsForInterview(User user, UUID interviewId) {
        // Idempotency check: has this interview already consumed credits?
        boolean alreadyConsumed = transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .anyMatch(tx -> tx.getType() == TransactionType.INTERVIEW_USAGE && 
                                interviewId.equals(tx.getReferenceId()));
        if (alreadyConsumed) {
            return true; // Already processed successfully
        }

        Wallet wallet = getOrCreateWallet(user);
        if (wallet.getBalance() < 10) {
            throw new IllegalStateException("Insufficient credits for interview");
        }

        wallet.setBalance(wallet.getBalance() - 10);
        wallet.setTotalConsumed(wallet.getTotalConsumed() + 10);
        walletRepository.save(wallet);

        User managedUser = userRepository.findById(user.getId()).orElse(user);

        CreditTransaction transaction = CreditTransaction.builder()
                .user(managedUser)
                .type(TransactionType.INTERVIEW_USAGE)
                .credits(-10L)
                .balanceAfter(wallet.getBalance())
                .referenceId(interviewId)
                .description("Video interview completed (ID: " + interviewId + ")")
                .build();
        transactionRepository.save(transaction);
        
        return true;
    }
}
