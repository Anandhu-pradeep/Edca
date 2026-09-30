package com.arcade.backend.payment.service;

import com.arcade.backend.payment.dto.PaymentOrderRequest;
import com.arcade.backend.payment.dto.PaymentOrderResponse;
import com.arcade.backend.payment.dto.PaymentVerificationRequest;
import com.arcade.backend.payment.model.CustomerType;
import com.arcade.backend.payment.model.Payment;
import com.arcade.backend.payment.model.PaymentStatus;
import com.arcade.backend.payment.repository.PaymentRepository;
import com.arcade.backend.user.User;
import com.razorpay.Order;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayService razorpayService;
    private final CreditService creditService;
    private final com.arcade.backend.organization.service.OrganizationCreditService organizationCreditService;

    @Transactional
    public PaymentOrderResponse createOrder(User user, PaymentOrderRequest request) {
        CustomerType type = isOrganization(user) ? CustomerType.ORGANIZATION : CustomerType.PERSONAL;
        
        long credits = request.getCredits();
        long amountInPaise = calculateAmountInPaise(credits, type);

        try {
            String receipt = "receipt_" + System.currentTimeMillis();
            Order razorpayOrder = razorpayService.createOrder(amountInPaise, "INR", receipt);

            Payment payment = Payment.builder()
                    .user(user)
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amountInPaise)
                    .currency("INR")
                    .credits(credits)
                    .customerType(type)
                    .status(PaymentStatus.CREATED)
                    .build();
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .orderId(payment.getRazorpayOrderId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .credits(payment.getCredits())
                    .build();

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void verifyPayment(PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return; // Already verified, prevent double crediting
        }

        boolean isValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            creditService.addCredits(
                    payment.getUser(),
                    payment.getCredits(),
                    payment.getId(),
                    "Purchased " + payment.getCredits() + " credits"
            );
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new IllegalStateException("Payment verification failed");
        }
    }

    @Transactional
    public PaymentOrderResponse createOrganizationOrder(User user, java.util.UUID organizationId, PaymentOrderRequest request) {
        long credits = request.getCredits();
        long amountInPaise = calculateAmountInPaise(credits, CustomerType.ORGANIZATION);

        try {
            String receipt = "org_receipt_" + System.currentTimeMillis();
            Order razorpayOrder = razorpayService.createOrder(amountInPaise, "INR", receipt);

            Payment payment = Payment.builder()
                    .user(user)
                    .organizationId(organizationId)
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amountInPaise)
                    .currency("INR")
                    .credits(credits)
                    .customerType(CustomerType.ORGANIZATION)
                    .status(PaymentStatus.CREATED)
                    .build();
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .orderId(payment.getRazorpayOrderId())
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .credits(payment.getCredits())
                    .build();

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void verifyOrganizationPayment(java.util.UUID organizationId, PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid order ID"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return; // Already verified
        }
        
        if (payment.getCustomerType() != CustomerType.ORGANIZATION || !payment.getOrganizationId().equals(organizationId)) {
            throw new IllegalArgumentException("Invalid payment type or organization");
        }

        boolean isValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (isValid) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            organizationCreditService.addCredits(
                    organizationId,
                    payment.getCredits().intValue(),
                    "Purchased " + payment.getCredits() + " credits via Razorpay"
            );
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new IllegalStateException("Payment verification failed");
        }
    }

    private boolean isOrganization(User user) {
        return user.getRoles().stream()
                .anyMatch(role -> "ROLE_ORGANIZATION".equals(role.getName()));
    }

    private long calculateAmountInPaise(long credits, CustomerType type) {
        if (type == CustomerType.ORGANIZATION) {
            // ₹0.50 per credit -> 50 paise per credit
            return credits * 50;
        } else {
            // ₹1 per credit -> 100 paise per credit
            return credits * 100;
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<com.arcade.backend.payment.dto.PaymentDto> getPaymentHistory(User user) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(payment -> com.arcade.backend.payment.dto.PaymentDto.builder()
                        .id(payment.getId())
                        .razorpayOrderId(payment.getRazorpayOrderId())
                        .amount(payment.getAmount())
                        .currency(payment.getCurrency())
                        .credits(payment.getCredits())
                        .status(payment.getStatus())
                        .createdAt(payment.getCreatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
