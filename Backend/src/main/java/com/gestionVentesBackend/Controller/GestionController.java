package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Gestion;
import com.gestionVentesBackend.Service.GestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour gérer les Gestions (Employé gère Produit)
 */
@RestController
@RequestMapping("/gestions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class GestionController {

    @Autowired
    private GestionService gestionService;

    @GetMapping
    public ResponseEntity<List<Gestion>> getAllGestions() {
        return ResponseEntity.ok(gestionService.getAllGestions());
    }

    @GetMapping("/employe/{idEmploye}")
    public ResponseEntity<List<Gestion>> getGestionsByEmploye(@PathVariable Long idEmploye) {
        return ResponseEntity.ok(gestionService.getGestionsByEmploye(idEmploye));
    }

    @GetMapping("/produit/{idProduit}")
    public ResponseEntity<List<Gestion>> getGestionsByProduit(@PathVariable Integer idProduit) {
        return ResponseEntity.ok(gestionService.getGestionsByProduit(idProduit));
    }

    @GetMapping("/{idEmploye}/{idProduit}")
    public ResponseEntity<Gestion> getGestionById(
            @PathVariable Long idEmploye, 
            @PathVariable Integer idProduit) {
        return gestionService.getGestionById(idEmploye, idProduit)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createGestion(@RequestBody Gestion gestion) {
        try {
            return ResponseEntity.ok(gestionService.createGestion(gestion));
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création de la gestion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    @PutMapping("/{idEmploye}/{idProduit}")
    public ResponseEntity<Gestion> updateGestion(
            @PathVariable Long idEmploye,
            @PathVariable Integer idProduit,
            @RequestBody Gestion gestion) {
        try {
            return ResponseEntity.ok(gestionService.updateGestion(idEmploye, idProduit, gestion));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idEmploye}/{idProduit}")
    public ResponseEntity<Void> deleteGestion(
            @PathVariable Long idEmploye,
            @PathVariable Integer idProduit) {
        gestionService.deleteGestion(idEmploye, idProduit);
        return ResponseEntity.noContent().build();
    }
}
