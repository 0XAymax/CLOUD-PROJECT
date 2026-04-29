package com.gestionVentesBackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de réponse pour l'exécution ETL.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtlRunResponseDTO {
    private String status;          // SUCCESS | FAILED | TIMEOUT
    private String savedFilePath;   // Chemin local du CSV sauvegardé
    private Integer exitCode;       // Code de retour du process Python
    private Long durationMs;        // Durée d'exécution
    private String stdout;          // Sortie standard (tronquée)
    private String stderr;          // Sortie erreur (tronquée)
}
