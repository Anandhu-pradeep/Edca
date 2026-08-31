package com.arcade.backend.payment.model;

import com.arcade.backend.common.entity.BaseEntity;
import com.arcade.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Long balance = 0L;

    @Column(name = "total_purchased", nullable = false)
    @Builder.Default
    private Long totalPurchased = 0L;

    @Column(name = "total_consumed", nullable = false)
    @Builder.Default
    private Long totalConsumed = 0L;
}
