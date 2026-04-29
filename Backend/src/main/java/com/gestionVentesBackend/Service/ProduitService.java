package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Produit;
import com.gestionVentesBackend.Repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Produits
 */
@Service
public class ProduitService {

    @Autowired
    private ProduitRepository produitRepository;

    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    public Optional<Produit> getProduitById(Integer id) {
        return produitRepository.findById(id);
    }

    public List<Produit> searchByNom(String nom) {
        return produitRepository.findByNomContainingIgnoreCase(nom);
    }

    public Produit createProduit(Produit produit) {
        return produitRepository.save(produit);
    }

    public Produit updateProduit(Integer id, Produit produitDetails) {
        Produit produit = produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        if (produitDetails.getNom() != null) produit.setNom(produitDetails.getNom());
        if (produitDetails.getPrix() != null) produit.setPrix(produitDetails.getPrix());
        if (produitDetails.getDescription() != null) produit.setDescription(produitDetails.getDescription());
        if (produitDetails.getImage() != null) produit.setImage(produitDetails.getImage());
        if (produitDetails.getQuantite() != null) produit.setQuantite(produitDetails.getQuantite());
        if (produitDetails.getRank() != null) produit.setRank(produitDetails.getRank());
        if (produitDetails.getRating() != null) produit.setRating(produitDetails.getRating());
        if (produitDetails.getReviews_count() != null) produit.setReviews_count(produitDetails.getReviews_count());
        
        return produitRepository.save(produit);
    }

    public void deleteProduit(Integer id) {
        produitRepository.deleteById(id);
    }
}
