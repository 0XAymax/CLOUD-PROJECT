package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Vente;
import com.gestionVentesBackend.Model.VenteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenteRepository extends JpaRepository<Vente, VenteId> {
    
    // Trouver toutes les ventes d'un client
    @Query("SELECT v FROM Vente v WHERE v.client.id = :clientId")
    List<Vente> findByClientId(@Param("clientId") Long clientId);
    
    // Trouver toutes les ventes d'un produit
    @Query("SELECT v FROM Vente v WHERE v.produit.id = :produitId")
    List<Vente> findByProduitId(@Param("produitId") Integer produitId);
    
    // Trouver les ventes d'un client entre deux dates
    @Query("SELECT v FROM Vente v WHERE v.client.id = :clientId AND v.dateVente BETWEEN :startDate AND :endDate")
    List<Vente> findByClientIdAndDateVenteBetween(
            @Param("clientId") Long clientId,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate
    );
}
