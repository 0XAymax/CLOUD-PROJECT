package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les réponses contenant les informations d'une vente
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenteResponseDTO {
    
    private String dateVente;
    private String heureVente;
    private Integer quantite;
    private Double totalPrice;
    
    private ClientSimpleDTO client;
    private ProduitSimpleDTO produit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientSimpleDTO {
        private Long id;
        private String nom;
        private String prenom;
        private String email;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProduitSimpleDTO {
        private Integer id;
        private String nom;
        private Double prix;
        private String image;
    }
}
