package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Gestion;
import com.gestionVentesBackend.Model.GestionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les opérations de base de données sur Gestion
 */
@Repository
public interface GestionRepository extends JpaRepository<Gestion, GestionId> {

    @Query("SELECT g FROM Gestion g WHERE g.employe.id = :idEmploye AND g.produit.id = :idProduit")
    Optional<Gestion> findByEmployeIdAndProduitId(@Param("idEmploye") Long idEmploye, @Param("idProduit") Integer idProduit);

    @Query("SELECT g FROM Gestion g WHERE g.employe.id = :idEmploye")
    List<Gestion> findByEmployeId(@Param("idEmploye") Long idEmploye);

    @Query("SELECT g FROM Gestion g WHERE g.produit.id = :idProduit")
    List<Gestion> findByProduitId(@Param("idProduit") Integer idProduit);
}

