package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Service.CategorieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour gérer les Catégories
 */
@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class CategorieController {

    @Autowired
    private CategorieService categorieService;

    @GetMapping
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Integer id) {
        return categorieService.getCategorieById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCategorie(@RequestBody Categorie categorie) {
        try {
            return ResponseEntity.ok(categorieService.createCategorie(categorie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategorie(@PathVariable Integer id, @RequestBody Categorie categorie) {
        try {
            return ResponseEntity.ok(categorieService.updateCategorie(id, categorie));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategorie(@PathVariable Integer id) {
        try {
            categorieService.deleteCategorie(id);
            return ResponseEntity.ok("Catégorie et tous ses produits supprimés avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
