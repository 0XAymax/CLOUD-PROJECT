package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * DTO pour les requêtes de création/mise à jour de produit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProduitRequestDTO {
    
    @NotBlank(message = "Le nom du produit est obligatoire")
    private String nom;

    @NotNull(message = "Le prix est obligatoire")
    @Positive(message = "Le prix doit être positif")
    private Double prix;

    private String description;

    private String image;

    @NotNull(message = "La quantité est obligatoire")
    @PositiveOrZero(message = "La quantité doit être positive ou nulle")
    private Integer quantite;

    @NotNull(message = "L'ID de la catégorie est obligatoire")
    private Integer categorieId;

    @PositiveOrZero(message = "Le rank doit être positif ou nul")
    private Integer rank;

    @PositiveOrZero(message = "Le rating doit être positif ou nul")
    private Double rating;

    @PositiveOrZero(message = "Le nombre de reviews doit être positif ou nul")
    private Integer reviewsCount;
}
