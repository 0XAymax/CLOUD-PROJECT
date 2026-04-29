package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Employe;
import com.gestionVentesBackend.Model.EtatEmploye;
import com.gestionVentesBackend.Repository.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Employés
 */
@Service
public class EmployeService {

    @Autowired
    private EmployeRepository employeRepository;

    public List<Employe> getAllEmployes() {
        return employeRepository.findAll();
    }

    public Optional<Employe> getEmployeById(Long id) {
        return employeRepository.findById(id);
    }

    public Employe createEmploye(Employe employe) {
        return employeRepository.save(employe);
    }

    public Employe updateEmploye(Long id, Employe employeDetails) {
        Employe employe = employeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employé non trouvé"));
        
        // Champs hérités de Personne
        if (employeDetails.getNom() != null) employe.setNom(employeDetails.getNom());
        if (employeDetails.getPrenom() != null) employe.setPrenom(employeDetails.getPrenom());
        if (employeDetails.getEmail() != null) employe.setEmail(employeDetails.getEmail());
        if (employeDetails.getNumeroTel() != null) employe.setNumeroTel(employeDetails.getNumeroTel());
        if (employeDetails.getAddress() != null) employe.setAddress(employeDetails.getAddress());
        if (employeDetails.getPhotoUrl() != null) employe.setPhotoUrl(employeDetails.getPhotoUrl());
        if (employeDetails.getPassword() != null) employe.setPassword(employeDetails.getPassword());
        
        // Champs spécifiques à Employe
        if (employeDetails.getSalaire() != null) employe.setSalaire(employeDetails.getSalaire());
        if (employeDetails.getRole() != null) employe.setRole(employeDetails.getRole());
        if (employeDetails.getAdmin() != null) employe.setAdmin(employeDetails.getAdmin());
        if (employeDetails.getEtat() != null) employe.setEtat(employeDetails.getEtat());
        
        return employeRepository.save(employe);
    }

    public void deleteEmploye(Long id) {
        employeRepository.deleteById(id);
    }

    // Trouver les employés gérés par un admin
    public List<Employe> getEmployesByAdmin(Long adminId) {
        return employeRepository.findByAdminId(adminId);
    }

    // Trouver les employés par état
    public List<Employe> getEmployesByEtat(EtatEmploye etat) {
        return employeRepository.findByEtat(etat);
    }
}