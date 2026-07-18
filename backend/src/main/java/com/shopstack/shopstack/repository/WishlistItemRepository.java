package com.shopstack.shopstack.repository;

import com.shopstack.shopstack.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, UUID> {
    List<WishlistItem> findByUserId(UUID userId);
    Optional<WishlistItem> findByUserIdAndProductId(UUID userId, UUID productId);
    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}