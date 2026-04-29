package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les réponses contenant les informations d'un produit
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProduitResponseDTO {
    
    private Integer id;
    private String nom;
    private Double prix;
    private String description;
    private String image;
    private Integer quantite;
    private Integer rank;
    private Double rating;
    private Integer reviewsCount;
    private CategorieDTO categorie;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorieDTO {
        private Integer id;
        private String nom;
    }
}
