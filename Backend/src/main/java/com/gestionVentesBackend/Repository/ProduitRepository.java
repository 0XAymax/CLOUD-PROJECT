package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Model.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Integer> {

    // Recherche par nom (insensible à la casse)
    List<Produit> findByNomContainingIgnoreCase(String nom);

    // Recherche par catégorie
    List<Produit> findByCategorie_Id(Integer categorieId);
    
    // Recherche par catégorie (alias)
    List<Produit> findByCategorieId(Integer categorieId);

    List<Produit> findByCategorie(Categorie categorie);
}