package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Investissement;
import com.gestionVentesBackend.Model.InvestissementId;
import com.gestionVentesBackend.Model.Investisseur;
import com.gestionVentesBackend.Model.Produit;
import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Repository.InvestissementRepository;
import com.gestionVentesBackend.Repository.InvestisseurRepository;
import com.gestionVentesBackend.Repository.ProduitRepository;
import com.gestionVentesBackend.Repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Investissements
 */
@Service
public class InvestissementService {

    @Autowired
    private InvestissementRepository investissementRepository;
    
    @Autowired
    private InvestisseurRepository investisseurRepository;
    
    @Autowired
    private ProduitRepository produitRepository;
    
    @Autowired
    private CategorieRepository categorieRepository;

    public List<Investissement> getAllInvestissements() {
        return investissementRepository.findAll();
    }

    public Optional<Investissement> getInvestissementById(Long idInvestisseur, Integer idProduit) {
        InvestissementId id = new InvestissementId(idInvestisseur, idProduit, null);
        return investissementRepository.findById(id);
    }

    public Investissement createInvestissement(Investissement investissement) {
        // Charger les entités complètes depuis la base de données
        Investisseur investisseur = null;
        
        if (investissement.getInvestisseur() != null && investissement.getInvestisseur().getId() != null) {
            investisseur = investisseurRepository.findById(investissement.getInvestisseur().getId())
                .orElseThrow(() -> new RuntimeException("Investisseur non trouvé"));
        }
        
        // CAS 1: Investissement dans un produit spécifique
        if (investissement.getProduit() != null && investissement.getProduit().getId() != null) {
            Produit produit = produitRepository.findById(investissement.getProduit().getId())
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
            
            Categorie categorie = produit.getCategorie();
            
            Investissement newInvestissement = Investissement.builder()
                .investisseur(investisseur)
                .produit(produit)
                .categorie(categorie)
                .montantInvestissement(investissement.getMontantInvestissement())
                .build();
            
            return investissementRepository.save(newInvestissement);
        } 
        // CAS 2: Investissement dans une catégorie (tous les produits de la catégorie)
        else if (investissement.getCategorie() != null && investissement.getCategorie().getId() != null) {
            Categorie categorie = categorieRepository.findById(investissement.getCategorie().getId())
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
            
            // Récupérer tous les produits de cette catégorie
            List<Produit> produits = produitRepository.findByCategorieId(categorie.getId());
            
            if (produits.isEmpty()) {
                throw new RuntimeException("Aucun produit trouvé dans cette catégorie");
            }
            
            // Diviser le montant total par le nombre de produits
            double montantParProduit = investissement.getMontantInvestissement() / produits.size();
            
            // Créer un investissement pour chaque produit de la catégorie
            Investissement lastInvestissement = null;
            for (Produit produit : produits) {
                Investissement newInvestissement = Investissement.builder()
                    .investisseur(investisseur)
                    .produit(produit)
                    .categorie(categorie)
                    .montantInvestissement(montantParProduit)
                    .build();
                
                lastInvestissement = investissementRepository.save(newInvestissement);
            }
            
            // Retourner le dernier investissement créé
            return lastInvestissement;
        }
        
        throw new RuntimeException("Investissement doit contenir soit un produit soit une catégorie");
    }

    public Investissement updateInvestissement(Long idInvestisseur, Integer idProduit, Investissement investissementDetails) {
        InvestissementId id = new InvestissementId(idInvestisseur, idProduit, null);
        Investissement investissement = investissementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Investissement non trouvé"));
        
        if (investissementDetails.getMontantInvestissement() != null) {
            investissement.setMontantInvestissement(investissementDetails.getMontantInvestissement());
        }
        if (investissementDetails.getCategorie() != null) {
            investissement.setCategorie(investissementDetails.getCategorie());
        }
        
        return investissementRepository.save(investissement);
    }

    public void deleteInvestissement(Long idInvestisseur, Integer idProduit, Integer idCategorie) {
        InvestissementId id = new InvestissementId(idInvestisseur, idProduit, idCategorie);
        if (!investissementRepository.existsById(id)) {
            throw new RuntimeException("Investissement non trouvé");
        }
        investissementRepository.deleteById(id);
    }

    // Obtenir les investissements par investisseur
    public List<Investissement> getInvestissementsByInvestisseur(Long idInvestisseur) {
        return investissementRepository.findByInvestisseurId(idInvestisseur);
    }

    // Obtenir les investissements par catégorie
    public List<Investissement> getInvestissementsByCategorie(Integer idCategorie) {
        return investissementRepository.findByCategorieId(idCategorie);
    }

    // Obtenir les investissements par produit
    public List<Investissement> getInvestissementsByProduit(Integer idProduit) {
        return investissementRepository.findByProduitId(idProduit);
    }
}
