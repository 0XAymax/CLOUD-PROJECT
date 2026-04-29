package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository pour gérer les opérations CRUD sur Categorie
 */
@Repository
public interface CategorieRepository extends JpaRepository<Categorie, Integer> {
    // Rechercher une catégorie par nom (insensible à la casse)
    Categorie findByNomIgnoreCase(String nom);
}
