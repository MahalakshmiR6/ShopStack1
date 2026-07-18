package com.shopstack.shopstack.service;

import com.shopstack.shopstack.model.Product;
import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.model.WishlistItem;
import com.shopstack.shopstack.repository.ProductRepository;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(WishlistItemRepository wishlistRepository,
                           UserRepository userRepository,
                           ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<WishlistItem> getWishlistByUserId(UUID userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public WishlistItem addToWishlist(UUID userId, UUID productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalArgumentException("Product already in wishlist");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();

        return wishlistRepository.save(item);
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found in wishlist"));
        wishlistRepository.delete(item);
    }

    public boolean isProductInWishlist(UUID userId, UUID productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}