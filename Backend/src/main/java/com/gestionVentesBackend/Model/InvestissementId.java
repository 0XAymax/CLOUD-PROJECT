package com.gestionVentesBackend.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * Classe de clé composite pour l'entité Investissement
 * Représente un investissement unique : Investisseur + (Produit OU Catégorie)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestissementId implements Serializable {

    private Long investisseur;  // Correspond à l'ID de Investisseur (Long)
    private Integer produit;  // Correspond à l'ID de Produit (Integer) - peut être null si investissement dans catégorie
    private Integer categorie;  // Correspond à l'ID de Catégorie (Integer) - peut être null si investissement dans produit

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        InvestissementId that = (InvestissementId) o;
        return Objects.equals(investisseur, that.investisseur) &&
               Objects.equals(produit, that.produit) &&
               Objects.equals(categorie, that.categorie);
    }

    @Override
    public int hashCode() {
        return Objects.hash(investisseur, produit, categorie);
    }
}
