package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/dashboard", "/dashboard"})
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:4200"})
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // 🔴 ENDPOINT PRINCIPAL - Toutes les stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = dashboardService.getAllStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    // 🔴 Stats rapides
    @GetMapping("/quick-stats")
    public ResponseEntity<Map<String, Object>> getQuickStats() {
        try {
            Map<String, Object> stats = dashboardService.getQuickStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/stats/filtre")
    public ResponseEntity<Map<String, Object>> getStatsFiltrees(
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin) {

        LocalDate debut = dateDebut != null ? LocalDate.parse(dateDebut) : null;
        LocalDate fin = dateFin != null ? LocalDate.parse(dateFin) : null;

        return ResponseEntity.ok(dashboardService.getStatsFiltrees(debut, fin));
    }

    @GetMapping("/meilleurs-clients")
    public ResponseEntity<List<Map<String, Object>>> getMeilleursClients(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getTopClients(limit));
    }

    @GetMapping("/top-produits")
    public ResponseEntity<List<Map<String, Object>>> getTopProduitsVendus(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(dashboardService.getTopProduitsVendus(limit));
    }

    // 🔴 NOUVEAUX ENDPOINTS POUR ANALYTICS
    @GetMapping("/ventes-mensuelles")
    public ResponseEntity<List<Map<String, Object>>> getVentesMensuelles(@RequestParam(required = false) Integer annee) {
        int targetYear = annee != null ? annee : LocalDate.now().getYear();
        return ResponseEntity.ok(dashboardService.getVentesMensuelles(targetYear));
    }

    @GetMapping("/evolution-ca")
    public ResponseEntity<List<Map<String, Object>>> getEvolutionCA(@RequestParam(defaultValue = "6") int mois) {
        return ResponseEntity.ok(dashboardService.getEvolutionCA(mois));
    }

    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getKPIs() {
        return ResponseEntity.ok(dashboardService.getKPIs());
    }

    @GetMapping("/performances")
    public ResponseEntity<Map<String, Object>> getPerformances() {
        return ResponseEntity.ok(dashboardService.getPerformances());
    }

    @GetMapping("/tendances")
    public ResponseEntity<List<Map<String, Object>>> getTendances() {
        return ResponseEntity.ok(dashboardService.getTendances());
    }

    @GetMapping("/repartition-categories")
    public ResponseEntity<List<Map<String, Object>>> getRepartitionCategories() {
        return ResponseEntity.ok(dashboardService.getRepartitionCategories());
    }

    @GetMapping("/statistiques-stock")
    public ResponseEntity<Map<String, Object>> getStatistiquesStock() {
        return ResponseEntity.ok(dashboardService.getStatistiquesStock());
    }

    @GetMapping("/alertes")
    public ResponseEntity<List<Map<String, Object>>> getAlertes() {
        return ResponseEntity.ok(dashboardService.getAlertes());
    }

    @GetMapping("/stats-globales")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        return ResponseEntity.ok(dashboardService.getGlobalStats());
    }

    // 🔴 ENDPOINT POUR LES SCORES (simulé)
    @GetMapping("/scores")
    public ResponseEntity<Map<String, Object>> getScores() {
        Map<String, Object> scores = new HashMap<>();

        // Scores simulés basés sur les stats
        Map<String, Object> kpis = dashboardService.getKPIs();
        Map<String, Object> performances = dashboardService.getPerformances();

        double conversionScore = (Double) kpis.get("conversionRate") * 2;
        double retentionScore = (Double) kpis.get("customerRetention");
        double growthScore = (Double) kpis.get("growthRate") * 0.5;
        double profitScore = (Double) kpis.get("profitMargin") * 0.8;

        double overallScore = (conversionScore + retentionScore + growthScore + profitScore) / 4;

        scores.put("scoreFinancier", Math.round(profitScore));
        scores.put("scoreOperational", Math.round(growthScore));
        scores.put("scoreClient", Math.round(retentionScore));
        scores.put("scoreVentes", Math.round(conversionScore));
        scores.put("scoreGlobal", Math.round(overallScore));
        scores.put("niveauPerformance", getPerformanceLevel(overallScore));

        return ResponseEntity.ok(scores);
    }

    private String getPerformanceLevel(double score) {
        if (score >= 90) return "Excellente";
        if (score >= 75) return "Bonne";
        if (score >= 60) return "Satisfaisante";
        if (score >= 40) return "À améliorer";
        return "Critique";
    }
}
