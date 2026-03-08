package edu.cit.ruperez.bookbrow.repository;

import edu.cit.ruperez.bookbrow.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByEmail(String email);
    boolean existsByEmail(String email);
}
