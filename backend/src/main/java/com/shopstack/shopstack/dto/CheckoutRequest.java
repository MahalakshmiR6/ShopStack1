package com.shopstack.shopstack.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CheckoutRequest {

    private List<CartItemRequest> items;

    private String couponCode;

    private String shippingAddress;

    private String billingAddress;

    private String paymentMethod;

    private String billingInfo;
}