package com.shopstack.shopstack.controller;

import com.shopstack.shopstack.model.VendorProfile;
import com.shopstack.shopstack.model.VendorStatus;
import com.shopstack.shopstack.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ProfileService profileService;

    public AdminController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorProfile>> listVendors(
            @RequestParam(value = "status", required = false) String statusStr) {
        
        if (statusStr != null && !statusStr.trim().isEmpty()) {
            try {
                VendorStatus status = VendorStatus.valueOf(statusStr.toUpperCase());
                return ResponseEntity.ok(profileService.getVendorsByStatus(status));
            } catch (IllegalArgumentException e) {
                // Ignore and return all if status string is invalid
            }
        }
        return ResponseEntity.ok(profileService.getAllVendors());
    }

    @PutMapping("/vendors/{id}/status")
    public ResponseEntity<?> updateVendorStatus(
            @PathVariable("id") UUID id,
            @RequestBody Map<String, Object> request) {
        
        try {
            String statusStr = (String) request.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }
            
            VendorStatus status = VendorStatus.valueOf(statusStr.toUpperCase());
            BigDecimal commissionRate = null;
            if (request.containsKey("commissionRate")) {
                Object rateObj = request.get("commissionRate");
                if (rateObj != null) {
                    commissionRate = new BigDecimal(rateObj.toString());
                }
            }
            
            VendorProfile updated = profileService.updateVendorStatus(id, status, commissionRate);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
