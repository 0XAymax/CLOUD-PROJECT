package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant la Gestion (Employé gère Produit)
 * Table d'association avec clé composée
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Gestion")
@IdClass(GestionId.class)
public class Gestion {

    public enum TypeEffet {
        AJOUT,
        MODIFICATION,
        SUPPRESSION
    }

    @Id
    @ManyToOne
    @JoinColumn(name = "id_employe", nullable = false)
    private Employe employe;

    @Id
    @ManyToOne
    @JoinColumn(name = "id_produit", nullable = false)
    private Produit produit;

    @Enumerated(EnumType.STRING)
    @Column(name = "effet", length = 50)
    private TypeEffet effet;


}
