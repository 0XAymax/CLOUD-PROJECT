package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    // Méthode pour trouver un rôle par son nom
    Optional<Role> findByNameRole(String nameRole);
    
    // Méthode pour vérifier si un rôle existe
    boolean existsByNameRole(String nameRole);
}
