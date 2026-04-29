package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant l'Investissement
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "Investissement")
@IdClass(InvestissementId.class)
public class Investissement {

    @Id
    @ManyToOne
    @JoinColumn(name = "id_investisseur", nullable = false)
    private Investisseur investisseur;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_produit")
    private Produit produit;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    @Column(name = "montant_investissement", columnDefinition = "DECIMAL(10,2)")
    private Double montantInvestissement;

    
}
