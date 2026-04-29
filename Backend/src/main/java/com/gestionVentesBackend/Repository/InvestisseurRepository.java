package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Investisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour gérer les opérations CRUD sur Investisseur
 */
@Repository
public interface InvestisseurRepository extends JpaRepository<Investisseur, Long> {
    Optional<Investisseur> findByEmail(String email);
    Optional<Investisseur> findByIce(String ice);
}
