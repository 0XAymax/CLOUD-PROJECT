package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Repository.CategorieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Catégories
 */
@Service
public class CategorieService {

    @Autowired
    private CategorieRepository categorieRepository;

    public List<Categorie> getAllCategories() {
        return categorieRepository.findAll();
    }

    public Optional<Categorie> getCategorieById(Integer id) {
        return categorieRepository.findById(id);
    }

    public Categorie createCategorie(Categorie categorie) {
        if (categorie.getNom() == null || categorie.getNom().trim().isEmpty()) {
            throw new RuntimeException("Le nom de la catégorie est obligatoire");
        }
        return categorieRepository.save(categorie);
    }

    public Categorie updateCategorie(Integer id, Categorie categorieDetails) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée"));
        
        if (categorieDetails.getNom() != null) {
            if (categorieDetails.getNom().trim().isEmpty()) {
                throw new RuntimeException("Le nom de la catégorie ne peut pas être vide");
            }
            categorie.setNom(categorieDetails.getNom());
        }
        if (categorieDetails.getDescription() != null) {
            categorie.setDescription(categorieDetails.getDescription());
        }
        
        return categorieRepository.save(categorie);
    }

    public void deleteCategorie(Integer id) {
        Categorie categorie = categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + id));
        
        // Vérifier s'il y a des investissements associés
        if (categorie.getInvestissements() != null && !categorie.getInvestissements().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer cette catégorie car elle a " + 
                categorie.getInvestissements().size() + " investissement(s) associé(s). " +
                "Veuillez d'abord supprimer les investissements.");
        }
        
        // Vérifier s'il y a des produits associés
        if (categorie.getProduits() != null && !categorie.getProduits().isEmpty()) {
            throw new RuntimeException("Impossible de supprimer cette catégorie car elle contient " + 
                categorie.getProduits().size() + " produit(s). " +
                "Veuillez d'abord supprimer ou réassigner les produits.");
        }
        
        categorieRepository.delete(categorie);
    }
}
