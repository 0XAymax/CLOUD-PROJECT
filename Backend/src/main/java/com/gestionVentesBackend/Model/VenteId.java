package com.gestionVentesBackend.Model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

/**
 * Classe de clé composite pour l'entité Vente
 * Représente une vente unique : Client + Produit + Date + Heure
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VenteId implements Serializable {

    private Long client;  // Correspond à l'ID de Client (Long)
    private Integer produit;  // Correspond à l'ID de Produit (Integer)
    private LocalDate dateVente;
    private LocalTime heureVente;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VenteId venteId = (VenteId) o;
        return Objects.equals(client, venteId.client) &&
               Objects.equals(produit, venteId.produit) &&
               Objects.equals(dateVente, venteId.dateVente) &&
               Objects.equals(heureVente, venteId.heureVente);
    }

    @Override
    public int hashCode() {
        return Objects.hash(client, produit, dateVente, heureVente);
    }
}
