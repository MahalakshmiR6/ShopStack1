package com.shopstack.shopstack.service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    public Map<String, Object> processPayment(BigDecimal amount, String paymentMethod, String billingInfo) {
        // If the cardholder name or billing info contains "FAIL" or "INSUFFICIENT", trigger a payment rejection
        if (billingInfo != null && (billingInfo.toUpperCase().contains("FAIL") || billingInfo.toUpperCase().contains("INSUFFICIENT"))) {
            return Map.of(
                "success", false,
                "error", "INSUFFICIENT_FUNDS",
                "message", "Payment declined: Insufficient funds or invalid card details."
            );
        }
        
        String transactionId = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return Map.of(
            "success", true,
            "transactionId", transactionId,
            "message", "Payment processed successfully."
        );
    }
}