package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Employe;
import com.gestionVentesBackend.Model.EtatEmploye;
import com.gestionVentesBackend.Service.EmployeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST pour gérer les Employés
 */
@RestController
@RequestMapping("/employes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class EmployeController {

    @Autowired
    private EmployeService employeService;

    @GetMapping
    public ResponseEntity<List<Employe>> getAllEmployes() {
        return ResponseEntity.ok(employeService.getAllEmployes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employe> getEmployeById(@PathVariable Long id) {
        return employeService.getEmployeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Employe>> getEmployesByAdmin(@PathVariable Long adminId) {
        return ResponseEntity.ok(employeService.getEmployesByAdmin(adminId));
    }

    @GetMapping("/etat/{etat}")
    public ResponseEntity<List<Employe>> getEmployesByEtat(@PathVariable EtatEmploye etat) {
        return ResponseEntity.ok(employeService.getEmployesByEtat(etat));
    }

    @PostMapping
    public ResponseEntity<Employe> createEmploye(@RequestBody Employe employe) {
        return ResponseEntity.ok(employeService.createEmploye(employe));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employe> updateEmploye(@PathVariable Long id, @RequestBody Employe employe) {
        try {
            return ResponseEntity.ok(employeService.updateEmploye(id, employe));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {
        try {
            employeService.deleteEmploye(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
