package com.arcade.backend.payment.repository;

import com.arcade.backend.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    boolean existsByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
