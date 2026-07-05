package com.shopstack.shopstack.repository;

import com.shopstack.shopstack.model.VendorProfile;
import com.shopstack.shopstack.model.VendorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorProfileRepository extends JpaRepository<VendorProfile, UUID> {
    Optional<VendorProfile> findByUserId(UUID userId);
    Optional<VendorProfile> findByStoreName(String storeName);
    List<VendorProfile> findByStatus(VendorStatus status);
}
