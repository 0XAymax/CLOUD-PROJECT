package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO pour les requêtes de création/mise à jour de catégorie
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieRequestDTO {
    
    @NotBlank(message = "Le nom de la catégorie est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String nom;

    private String description;
}
