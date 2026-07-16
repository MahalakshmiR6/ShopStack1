package com.shopstack.shopstack.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    private RazorpayClient client;

    @PostConstruct
    public void init() {
        if (keyId != null && !keyId.trim().isEmpty() && keySecret != null && !keySecret.trim().isEmpty()) {
            try {
                this.client = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                System.err.println("Failed to initialize Razorpay Client: " + e.getMessage());
            }
        }
    }

    public Map<String, Object> createRazorpayOrder(BigDecimal amount) {
        try {
            if (this.client == null) {
                throw new IllegalStateException("Razorpay client is not initialized. Please configure key id and secret in properties.");
            }
            int amountInPaise = amount.multiply(new BigDecimal(100)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString().substring(0, 10));

            Order order = client.orders.create(orderRequest);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("keyId", keyId);
            return response;
        } catch (RazorpayException e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }

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