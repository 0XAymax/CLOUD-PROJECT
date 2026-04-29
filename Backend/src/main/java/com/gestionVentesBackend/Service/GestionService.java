package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Gestion;
import com.gestionVentesBackend.Model.GestionId;
import com.gestionVentesBackend.Repository.GestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Gestions (Employé gère Produit)
 */
@Service
public class GestionService {

    @Autowired
    private GestionRepository gestionRepository;

    public List<Gestion> getAllGestions() {
        return gestionRepository.findAll();
    }

    public Optional<Gestion> getGestionById(Long idEmploye, Integer idProduit) {
        GestionId id = new GestionId(idEmploye, idProduit);
        return gestionRepository.findById(id);
    }

    public Gestion createGestion(Gestion gestion) {
        return gestionRepository.save(gestion);
    }

    public Gestion updateGestion(Long idEmploye, Integer idProduit, Gestion gestionDetails) {
        GestionId id = new GestionId(idEmploye, idProduit);
        Gestion gestion = gestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gestion non trouvée"));
        
        if (gestionDetails.getEffet() != null) {
            gestion.setEffet(gestionDetails.getEffet());
        }
        
        return gestionRepository.save(gestion);
    }

    public void deleteGestion(Long idEmploye, Integer idProduit) {
        GestionId id = new GestionId(idEmploye, idProduit);
        gestionRepository.deleteById(id);
    }

    // Obtenir toutes les gestions d'un employé
    public List<Gestion> getGestionsByEmploye(Long idEmploye) {
        return gestionRepository.findByEmployeId(idEmploye);
    }

    // Obtenir toutes les gestions d'un produit
    public List<Gestion> getGestionsByProduit(Integer idProduit) {
        return gestionRepository.findByProduitId(idProduit);
    }
}
