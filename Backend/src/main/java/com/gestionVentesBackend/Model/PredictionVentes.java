package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Table analytique: prediction_ventes
 *
 * Table alimentée par l'ETL Python (ex: prévision mensuelle du CA).
 */
@Entity
@Table(name = "prediction_ventes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionVentes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "mois", nullable = false)
    private Integer mois;

    @Column(name = "chiffre_affaires_prevu", precision = 18, scale = 2, nullable = false)
    private BigDecimal chiffreAffairesPrevu;

    @Column(name = "modele", length = 100)
    private String modele;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
