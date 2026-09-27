package com.arcade.backend.payment.redeem;

import com.arcade.backend.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "redeem_code_redemptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemCodeRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "redeem_code_id", nullable = false)
    private RedeemCode redeemCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "credits_granted", nullable = false)
    private Long creditsGranted;

    @Column(name = "redeemed_at", nullable = false)
    @Builder.Default
    private ZonedDateTime redeemedAt = ZonedDateTime.now();
}
