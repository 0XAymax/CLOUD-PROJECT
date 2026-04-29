package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Investisseur;
import com.gestionVentesBackend.Service.InvestisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour gérer les Investisseurs
 */
@RestController
@RequestMapping("/investisseurs")
@CrossOrigin(origins = "${app.cors.origins}")
public class InvestisseurController {

    @Autowired
    private InvestisseurService investisseurService;

    @GetMapping
    public ResponseEntity<List<Investisseur>> getAllInvestisseurs() {
        return ResponseEntity.ok(investisseurService.getAllInvestisseurs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investisseur> getInvestisseurById(@PathVariable Long id) {
        return investisseurService.getInvestisseurById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Investisseur> createInvestisseur(@RequestBody Investisseur investisseur) {
        return ResponseEntity.ok(investisseurService.createInvestisseur(investisseur));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investisseur> updateInvestisseur(@PathVariable Long id, @RequestBody Investisseur investisseur) {
        try {
            return ResponseEntity.ok(investisseurService.updateInvestisseur(id, investisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteInvestisseur(@PathVariable Long id) {
        try {
            investisseurService.deleteInvestisseur(id);
            return ResponseEntity.ok("Investisseur supprimé avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
