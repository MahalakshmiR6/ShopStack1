package com.shopstack.shopstack.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CartItemRequest {

    private UUID productId;

    private Integer quantity;
}