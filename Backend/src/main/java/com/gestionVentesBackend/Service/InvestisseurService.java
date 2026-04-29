package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Investisseur;
import com.gestionVentesBackend.Repository.InvestisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Investisseurs
 */
@Service
public class InvestisseurService {

    @Autowired
    private InvestisseurRepository investisseurRepository;

    public List<Investisseur> getAllInvestisseurs() {
        return investisseurRepository.findAll();
    }

    public Optional<Investisseur> getInvestisseurById(Long id) {
        return investisseurRepository.findById(id);
    }

    public Investisseur createInvestisseur(Investisseur investisseur) {
        return investisseurRepository.save(investisseur);
    }

    public Investisseur updateInvestisseur(Long id, Investisseur investisseurDetails) {
        Investisseur investisseur = investisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investisseur non trouvé"));
        
        // Champs hérités de Personne
        if (investisseurDetails.getNom() != null) investisseur.setNom(investisseurDetails.getNom());
        if (investisseurDetails.getPrenom() != null) investisseur.setPrenom(investisseurDetails.getPrenom());
        if (investisseurDetails.getEmail() != null) investisseur.setEmail(investisseurDetails.getEmail());
        if (investisseurDetails.getNumeroTel() != null) investisseur.setNumeroTel(investisseurDetails.getNumeroTel());
        if (investisseurDetails.getAddress() != null) investisseur.setAddress(investisseurDetails.getAddress());
        if (investisseurDetails.getPhotoUrl() != null) investisseur.setPhotoUrl(investisseurDetails.getPhotoUrl());
        if (investisseurDetails.getPassword() != null) investisseur.setPassword(investisseurDetails.getPassword());
        
        // Champs spécifiques à Investisseur
        if (investisseurDetails.getIce() != null) investisseur.setIce(investisseurDetails.getIce());
        if (investisseurDetails.getNom_entreprise() != null) investisseur.setNom_entreprise(investisseurDetails.getNom_entreprise());
        if (investisseurDetails.getAdresse_entreprise() != null) investisseur.setAdresse_entreprise(investisseurDetails.getAdresse_entreprise());
        if (investisseurDetails.getNumero_entreprise() != null) investisseur.setNumero_entreprise(investisseurDetails.getNumero_entreprise());
        if (investisseurDetails.getEmail_entreprise() != null) investisseur.setEmail_entreprise(investisseurDetails.getEmail_entreprise());
        if (investisseurDetails.getLogo_url() != null) investisseur.setLogo_url(investisseurDetails.getLogo_url());
        if (investisseurDetails.getDomaine_entreprise() != null) investisseur.setDomaine_entreprise(investisseurDetails.getDomaine_entreprise());
        if (investisseurDetails.getCapitalDisponible() != null) investisseur.setCapitalDisponible(investisseurDetails.getCapitalDisponible());
        
        return investisseurRepository.save(investisseur);
    }

    public void deleteInvestisseur(Long id) {
        Investisseur investisseur = investisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investisseur non trouvé avec l'ID: " + id));
        
        // Vérifier s'il y a des investissements associés
        if (investisseur.getInvestissements() != null && !investisseur.getInvestissements().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer cet investisseur car il a " + 
                investisseur.getInvestissements().size() + " investissement(s) associé(s). " +
                "Veuillez d'abord supprimer les investissements.");
        }
        
        investisseurRepository.delete(investisseur);
    }
}
