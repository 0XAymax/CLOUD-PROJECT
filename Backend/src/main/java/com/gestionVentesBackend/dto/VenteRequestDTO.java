package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO pour les requêtes de création de vente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteRequestDTO {
    
    @NotNull(message = "L'ID du client est obligatoire")
    private Long clientId;

    @NotNull(message = "L'ID du produit est obligatoire")
    private Integer produitId;

    @NotNull(message = "La date de vente est obligatoire")
    private String dateVente;  // Format: "2025-12-20"

    @NotNull(message = "L'heure de vente est obligatoire")
    private String heureVente; // Format: "14:35:30"

    @NotNull(message = "La quantité est obligatoire")
    @Positive(message = "La quantité doit être positive")
    private Integer quantite;
}
