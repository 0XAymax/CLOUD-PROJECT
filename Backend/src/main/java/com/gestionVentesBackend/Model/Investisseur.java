package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entité représentant un Investisseur
 * Hérite de Personne
 */
@Entity
@Table(name = "Investisseur")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@PrimaryKeyJoinColumn(name = "id_investisseur")
public class Investisseur extends Personne {

    @Column(name = "ice", length = 200)
    private String ice;

    @Column(name = "nom_entreprise", length = 200)
    private String nom_entreprise;

    @Column(name = "adresse_entreprise", length = 255)
    private String adresse_entreprise;

    @Column(name = "numero_entreprise", length = 50)
    private String numero_entreprise;

    @Column(name = "email_entreprise", length = 150)
    private String email_entreprise;

    @Column(name = "logo_url", length = 500)
    private String logo_url;

    @Column(name = "domaine_entreprise", length = 200)
    private String domaine_entreprise;

    @Column(name = "capital_disponible", columnDefinition = "DECIMAL(15,2)")
    private Double capitalDisponible;

    @OneToMany(mappedBy = "investisseur")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private java.util.List<Investissement> investissements;

    
}