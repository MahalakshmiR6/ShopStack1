package com.shopstack.shopstack.repository;

import com.shopstack.shopstack.model.User;
import com.shopstack.shopstack.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByRole(Role role);
    List<User> findByRole(Role role);
}
