package com.arcade.backend.payment.redeem;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RedeemCodeRedemptionRepository extends JpaRepository<RedeemCodeRedemption, UUID> {
    int countByRedeemCodeIdAndUserId(UUID redeemCodeId, UUID userId);
    List<RedeemCodeRedemption> findByRedeemCodeId(UUID redeemCodeId);
}
