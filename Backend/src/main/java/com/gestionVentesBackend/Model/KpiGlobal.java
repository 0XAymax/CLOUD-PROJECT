package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Table analytique: kpi_global
 *
 * Cette table est alimentée par le pipeline Python ETL.
 * Spring Boot ne fait AUCUN recalcul: il expose uniquement des endpoints READ-ONLY.
 */
@Entity
@Table(name = "kpi_global")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpiGlobal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "annee", nullable = false)
    private Integer annee;

    @Column(name = "mois", nullable = false)
    private Integer mois;

    @Column(name = "chiffre_affaires_total", precision = 18, scale = 2, nullable = false)
    private BigDecimal chiffreAffairesTotal;

    @Column(name = "nb_ventes", nullable = false)
    private Long nbVentes;

    @Column(name = "panier_moyen", precision = 18, scale = 2)
    private BigDecimal panierMoyen;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
