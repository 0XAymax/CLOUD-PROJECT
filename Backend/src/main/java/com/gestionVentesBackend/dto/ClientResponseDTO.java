package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les réponses contenant les informations d'un client
 * (sans le mot de passe pour des raisons de sécurité)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponseDTO {
    
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String numeroTel;
    private String address;
    private String role;
}
