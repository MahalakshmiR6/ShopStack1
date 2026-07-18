package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.model.WishlistItem;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    public WishlistController(WishlistService wishlistService, UserRepository userRepository) {
        this.wishlistService = wishlistService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getWishlist() {
        try {
            User user = getCurrentUser();
            List<WishlistItem> wishlist = wishlistService.getWishlistByUserId(user.getId());
            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable("productId") UUID productId) {
        try {
            User user = getCurrentUser();
            WishlistItem item = wishlistService.addToWishlist(user.getId(), productId);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable("productId") UUID productId) {
        try {
            User user = getCurrentUser();
            wishlistService.removeFromWishlist(user.getId(), productId);
            return ResponseEntity.ok(Map.of("message", "Product removed from wishlist successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<?> checkWishlist(@PathVariable("productId") UUID productId) {
        try {
            User user = getCurrentUser();
            boolean inWishlist = wishlistService.isProductInWishlist(user.getId(), productId);
            return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}