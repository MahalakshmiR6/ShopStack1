package com.shopstack.shopstack.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.shopstack.dto.CheckoutRequest;
import com.shopstack.shopstack.model.Order;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.repository.CouponRepository;
import com.shopstack.shopstack.repository.OrderRepository;
import com.shopstack.shopstack.repository.ProductRepository;
import java.util.ArrayList;
import java.util.List;

import com.shopstack.shopstack.dto.CartItemRequest;
import com.shopstack.shopstack.model.Coupon;
import com.shopstack.shopstack.model.OrderItem;
import com.shopstack.shopstack.model.Product;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CouponRepository couponRepository;
    private final PaymentService paymentService;


    public Order placeOrder(User user, CheckoutRequest request) {

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal finalAmount;

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemRequest item : request.getItems()) {

            Product product = productRepository.findByIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getName());
            }

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));

            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(item.getQuantity())
                    .price(product.getPrice())
                    .build();

            orderItems.add(orderItem);
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {

            Coupon coupon = couponRepository
                    .findByCodeIgnoreCaseAndActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Invalid Coupon"));

            if (coupon.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Coupon Expired");
            }

            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {

                discount = subtotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));

            } else if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {

                discount = coupon.getDiscountValue();

            }
        }

        finalAmount = subtotal.subtract(discount);

        String transactionId;

        if ("RAZORPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            boolean isValid = paymentService.verifySignature(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (!isValid) {
                throw new RuntimeException("Payment signature verification failed.");
            }
            transactionId = request.getRazorpayPaymentId();
        } else {
            var paymentResult = paymentService.processPayment(
                    finalAmount,
                    request.getPaymentMethod(),
                    request.getBillingInfo()
            );

            if (!(Boolean) paymentResult.get("success")) {
                throw new RuntimeException(
                        paymentResult.get("message").toString());
            }
            transactionId = paymentResult.get("transactionId").toString();
        }


        Order order = Order.builder()
                .user(user)
                .subtotal(subtotal)
                .discount(discount)
                .finalAmount(finalAmount)
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PAID")
                .trackingStatus("PLACED")
                .transactionId(transactionId)
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }

        order.setItems(orderItems);



        for (CartItemRequest item : request.getItems()) {

            Product product = productRepository
                    .findByIdForUpdate(item.getProductId())
                    .orElseThrow();

            product.setStockQuantity(
                    product.getStockQuantity() - item.getQuantity()
            );

            productRepository.save(product);
        }



        return orderRepository.save(order);


    }


    public List<Order> getOrdersByUser(User user) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(user.getId());
    }

    public Order getOrderById(java.util.UUID orderId, User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return order;
    }

    public Order updateOrderStatus(java.util.UUID orderId, String status, User user) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setTrackingStatus(status);

        return orderRepository.save(order);
    }

    public List<Order> getOrdersForVendor(User user) {

        if (user.getRole() != com.shopstack.shopstack.model.Role.VENDOR) {
            throw new RuntimeException("Access denied");
        }

        return orderRepository.findByVendorId(user.getId());
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public BigDecimal calculateOrderTotal(CheckoutRequest request) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;

        for (CartItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            BigDecimal itemTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemTotal);
        }

        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository
                    .findByCodeIgnoreCaseAndActiveTrue(request.getCouponCode())
                    .orElseThrow(() -> new RuntimeException("Invalid Coupon"));

            if (coupon.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Coupon Expired");
            }

            if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = subtotal.multiply(coupon.getDiscountValue())
                        .divide(BigDecimal.valueOf(100));
            } else if ("FLAT".equalsIgnoreCase(coupon.getDiscountType())) {
                discount = coupon.getDiscountValue();
            }
        }

        return subtotal.subtract(discount);
    }

}