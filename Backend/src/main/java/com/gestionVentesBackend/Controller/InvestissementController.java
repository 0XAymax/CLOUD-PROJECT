package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Investissement;
import com.gestionVentesBackend.Service.InvestissementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour gérer les Investissements
 */
@RestController
@RequestMapping("/investissements")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class InvestissementController {

    @Autowired
    private InvestissementService investissementService;

    @GetMapping
    public ResponseEntity<List<Investissement>> getAllInvestissements() {
        return ResponseEntity.ok(investissementService.getAllInvestissements());
    }

    @GetMapping("/{idInvestisseur}/{idProduit}")
    public ResponseEntity<Investissement> getInvestissementById(
            @PathVariable Long idInvestisseur,
            @PathVariable Integer idProduit) {
        return investissementService.getInvestissementById(idInvestisseur, idProduit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/investisseur/{idInvestisseur}")
    public ResponseEntity<List<Investissement>> getInvestissementsByInvestisseur(@PathVariable Long idInvestisseur) {
        return ResponseEntity.ok(investissementService.getInvestissementsByInvestisseur(idInvestisseur));
    }

    @GetMapping("/categorie/{idCategorie}")
    public ResponseEntity<List<Investissement>> getInvestissementsByCategorie(@PathVariable Integer idCategorie) {
        return ResponseEntity.ok(investissementService.getInvestissementsByCategorie(idCategorie));
    }

    @GetMapping("/produit/{idProduit}")
    public ResponseEntity<List<Investissement>> getInvestissementsByProduit(@PathVariable Integer idProduit) {
        return ResponseEntity.ok(investissementService.getInvestissementsByProduit(idProduit));
    }

    @PostMapping
    public ResponseEntity<Investissement> createInvestissement(@RequestBody Investissement investissement) {
        return ResponseEntity.ok(investissementService.createInvestissement(investissement));
    }

    @PutMapping("/{idInvestisseur}/{idProduit}")
    public ResponseEntity<Investissement> updateInvestissement(
            @PathVariable Long idInvestisseur,
            @PathVariable Integer idProduit,
            @RequestBody Investissement investissement) {
        try {
            return ResponseEntity.ok(investissementService.updateInvestissement(idInvestisseur, idProduit, investissement));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idInvestisseur}/{idProduit}/{idCategorie}")
    public ResponseEntity<String> deleteInvestissement(
            @PathVariable Long idInvestisseur,
            @PathVariable Integer idProduit,
            @PathVariable Integer idCategorie) {
        try {
            investissementService.deleteInvestissement(idInvestisseur, idProduit, idCategorie);
            return ResponseEntity.ok("Investissement supprimé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
