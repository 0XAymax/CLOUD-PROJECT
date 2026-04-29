package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Vente;
import com.gestionVentesBackend.Service.VenteService;
import com.gestionVentesBackend.dto.VenteRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Controller REST pour gérer les Ventes
 */
@RestController
@RequestMapping("/ventes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class VenteController {

    @Autowired
    private VenteService venteService;

    @GetMapping
    public ResponseEntity<List<Vente>> getAllVentes() {
        return ResponseEntity.ok(venteService.getAllVentes());
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Vente>> getVentesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(venteService.getVentesByClient(clientId));
    }

    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<Vente>> getVentesByProduit(@PathVariable Integer produitId) {
        return ResponseEntity.ok(venteService.getVentesByProduit(produitId));
    }

    @GetMapping("/{clientId}/{produitId}/{dateVente}/{heureVente}")
    public ResponseEntity<Vente> getVenteById(
            @PathVariable Long clientId,
            @PathVariable Integer produitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateVente,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureVente) {
        return venteService.getVenteById(clientId, produitId, dateVente, heureVente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createVente(@Valid @RequestBody VenteRequestDTO venteDTO) {
        try {
            Vente vente = venteService.createVenteFromDTO(venteDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(vente);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{clientId}/{produitId}/{dateVente}/{heureVente}")
    public ResponseEntity<Vente> updateVente(
            @PathVariable Long clientId,
            @PathVariable Integer produitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateVente,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureVente,
            @RequestBody Vente vente) {
        try {
            return ResponseEntity.ok(venteService.updateVente(clientId, produitId, dateVente, heureVente, vente));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{clientId}/{produitId}/{dateVente}/{heureVente}")
    public ResponseEntity<Void> deleteVente(
            @PathVariable Long clientId,
            @PathVariable Integer produitId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateVente,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime heureVente) {
        venteService.deleteVente(clientId, produitId, dateVente, heureVente);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/client/{clientId}/total")
    public ResponseEntity<Double> getTotalVentesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(venteService.getTotalVentesByClientId(clientId));
    }

    @GetMapping("/client/{clientId}/count")
    public ResponseEntity<Long> getCountVentesByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(venteService.getCountVentesByClientId(clientId));
    }
}
