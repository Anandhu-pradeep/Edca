package com.arcade.backend.organization.service;

import com.arcade.backend.organization.dto.OrganizationCreditResponseDto;
import com.arcade.backend.organization.entity.Organization;
import com.arcade.backend.organization.entity.OrganizationCreditTransaction;
import com.arcade.backend.organization.entity.OrganizationCreditWallet;
import com.arcade.backend.organization.repository.OrganizationCreditTransactionRepository;
import com.arcade.backend.organization.repository.OrganizationCreditWalletRepository;
import com.arcade.backend.organization.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationCreditService {

    private final OrganizationCreditWalletRepository walletRepository;
    private final OrganizationCreditTransactionRepository transactionRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional
    public void createWalletForOrganization(Organization organization) {
        if (walletRepository.findByOrganizationId(organization.getId()).isEmpty()) {
            OrganizationCreditWallet wallet = OrganizationCreditWallet.builder()
                    .organization(organization)
                    .balance(0)
                    .reservedBalance(0)
                    .build();
            walletRepository.save(wallet);
        }
    }

    public OrganizationCreditResponseDto getWalletStatus(UUID organizationId) {
        OrganizationCreditWallet wallet = walletRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for organization"));

        List<OrganizationCreditResponseDto.TransactionDto> recentTxs = transactionRepository
                .findByWalletIdOrderByCreatedAtDesc(wallet.getId()).stream()
                .limit(10)
                .map(tx -> OrganizationCreditResponseDto.TransactionDto.builder()
                        .id(tx.getId())
                        .amount(tx.getAmount())
                        .transactionType(tx.getTransactionType())
                        .description(tx.getDescription())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return OrganizationCreditResponseDto.builder()
                .organizationId(organizationId)
                .balance(wallet.getBalance())
                .reservedBalance(wallet.getReservedBalance())
                .recentTransactions(recentTxs)
                .build();
    }

    @Transactional
    public void addCredits(UUID organizationId, int amount, String description) {
        OrganizationCreditWallet wallet = walletRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for organization"));
        
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        OrganizationCreditTransaction tx = OrganizationCreditTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .transactionType("PURCHASE")
                .description(description)
                .build();
        transactionRepository.save(tx);
    }

    @Transactional
    public void consumeCredits(UUID organizationId, int amount, String description) {
        OrganizationCreditWallet wallet = walletRepository.findByOrganizationId(organizationId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for organization"));
        
        if (wallet.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient organization credits.");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        OrganizationCreditTransaction tx = OrganizationCreditTransaction.builder()
                .wallet(wallet)
                .amount(-amount)
                .transactionType("CONSUMPTION")
                .description(description)
                .build();
        transactionRepository.save(tx);
    }
}
