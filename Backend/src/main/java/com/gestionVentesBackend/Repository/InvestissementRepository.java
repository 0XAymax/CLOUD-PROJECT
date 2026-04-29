package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Investissement;
import com.gestionVentesBackend.Model.InvestissementId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour gérer les opérations de base de données sur Investissement
 */
@Repository
public interface InvestissementRepository extends JpaRepository<Investissement, InvestissementId> {

    @Query("SELECT i FROM Investissement i WHERE i.investisseur.id = :idInvestisseur")
    List<Investissement> findByInvestisseurId(@Param("idInvestisseur") Long idInvestisseur);

    @Query("SELECT i FROM Investissement i WHERE i.categorie.id = :idCategorie")
    List<Investissement> findByCategorieId(@Param("idCategorie") Integer idCategorie);

    @Query("SELECT i FROM Investissement i WHERE i.produit.id = :idProduit")
    List<Investissement> findByProduitId(@Param("idProduit") Integer idProduit);
}
