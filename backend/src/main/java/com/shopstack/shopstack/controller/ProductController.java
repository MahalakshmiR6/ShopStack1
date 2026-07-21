package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.model.*;
import com.shopstack.shopstack.repository.UserRepository;
import com.shopstack.shopstack.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class ProductController {

    private final ProductService productService;
    private final UserRepository userRepository;

    public ProductController(ProductService productService, UserRepository userRepository) {
        this.productService = productService;
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

    // --- PUBLIC ENDPOINTS ---

    @GetMapping("/api/products/public")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(value = "maxPrice", required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(productService.searchProducts(query, categoryId, minPrice, maxPrice));
    }

    @GetMapping("/api/products/public/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable("slug") String slug) {
        try {
            Product product = productService.getProductBySlug(slug);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- VENDOR ENDPOINTS ---

    @PostMapping("/api/vendor/products")
    public ResponseEntity<?> createProduct(
            @RequestBody Product product,
            @RequestParam(value = "categoryId", required = false) UUID categoryId) {
        try {
            User user = getCurrentUser();
            Product created = productService.createProduct(user.getId(), product, categoryId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable("id") UUID id,
            @RequestBody Product product,
            @RequestParam(value = "categoryId", required = false) UUID categoryId) {
        try {
            User user = getCurrentUser();
            Product updated = productService.updateProduct(user.getId(), id, product, categoryId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/vendor/products/{id}/stock")
    public ResponseEntity<?> updateVendorStock(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            Number stockQuantityNum = (Number) request.get("stockQuantity");
            if (stockQuantityNum == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "stockQuantity is required"));
            }
            Product updated = productService.updateStockQuantity(user, id, stockQuantityNum.intValue());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/api/admin/products/{id}/stock")
    public ResponseEntity<?> updateAdminStock(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            Number stockQuantityNum = (Number) request.get("stockQuantity");
            if (stockQuantityNum == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "stockQuantity is required"));
            }
            Product updated = productService.updateStockQuantity(user, id, stockQuantityNum.intValue());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/vendor/products")
    public ResponseEntity<?> getVendorProducts() {
        try {
            User user = getCurrentUser();
            List<Product> products = productService.getProductsByVendor(user.getId());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/vendor/products/{id}/submit")
    public ResponseEntity<?> submitForApproval(@PathVariable("id") UUID id) {
        try {
            User user = getCurrentUser();
            Product product = productService.submitForApproval(user.getId(), id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/vendor/products/{id}/image")
    public ResponseEntity<?> addProductImage(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            String imageUrl = (String) request.get("imageUrl");
            Boolean isPrimary = (Boolean) request.get("isPrimary");
            if (imageUrl == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "imageUrl is required"));
            }
            ProductImage image = productService.addProductImage(user.getId(), id, imageUrl, isPrimary != null && isPrimary);
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- REVIEWS (AUTHENTICATED CUSTOMERS/USERS) ---

    @PostMapping("/api/products/{id}/review")
    public ResponseEntity<?> addReview(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            Integer rating = (Integer) request.get("rating");
            String comment = (String) request.get("comment");
            if (rating == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "rating is required"));
            }
            ProductReview review = productService.addReview(user, id, rating, comment);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/api/admin/products/pending")
    public ResponseEntity<List<Product>> getPendingProducts() {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @PutMapping("/api/admin/products/{id}/approve")
    public ResponseEntity<?> approveProduct(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        try {
            String statusStr = (String) request.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
            }
            ProductStatus status = ProductStatus.valueOf(statusStr.toUpperCase());
            Product product = productService.approveProduct(id, status);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> deleteVendorProduct(@PathVariable("id") UUID id) {
        try {
            User user = getCurrentUser();
            productService.deleteProduct(user.getId(), user.getRole(), id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/admin/products/{id}")
    public ResponseEntity<?> deleteAdminProduct(@PathVariable("id") UUID id) {
        try {
            User user = getCurrentUser();
            productService.deleteProduct(user.getId(), user.getRole(), id);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
