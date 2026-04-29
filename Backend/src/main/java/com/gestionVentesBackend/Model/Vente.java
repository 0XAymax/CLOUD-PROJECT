package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant une Vente (Client achète Produit)
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Vente")
@IdClass(VenteId.class)
public class Vente {

    @Id
    @ManyToOne
    @JoinColumn(name = "id_client", nullable = false)
    private Client client;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_produit", nullable = false)
    private Produit produit;

    @Id
    @Column(name = "date_vente", nullable = false)
    private java.time.LocalDate dateVente;

    @Id
    @Column(name = "heure_vente", nullable = false)
    private java.time.LocalTime heureVente;

    @Column(name = "quantite", nullable = false)
    private Integer quantite;

}
