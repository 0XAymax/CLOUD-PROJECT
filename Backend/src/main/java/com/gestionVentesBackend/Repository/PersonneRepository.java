package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Personne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// JpaRepository fournit automatiquement les méthodes CRUD de base (save, findById, findAll, etc.)
@Repository
public interface PersonneRepository extends JpaRepository<Personne, Long> {

    // Méthode personnalisée pour trouver une personne par email (nécessaire pour la connexion)
    Optional<Personne> findByEmail(String email);

    // Méthode personnalisée pour vérifier si un email existe déjà (nécessaire pour l'inscription)
    boolean existsByEmail(String email);
}
