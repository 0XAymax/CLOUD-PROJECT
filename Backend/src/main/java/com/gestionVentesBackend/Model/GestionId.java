package com.gestionVentesBackend.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

/**
 * Classe de clé composite pour l'entité Gestion
 * Représente la relation entre Employé et Produit
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GestionId implements Serializable {

    private Long employe;  // Correspond à l'ID de Employe (Long)
    private Integer produit;  // Correspond à l'ID de Produit (Integer)

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GestionId gestionId = (GestionId) o;
        return Objects.equals(employe, gestionId.employe) &&
               Objects.equals(produit, gestionId.produit);
    }

    @Override
    public int hashCode() {
        return Objects.hash(employe, produit);
    }
}
