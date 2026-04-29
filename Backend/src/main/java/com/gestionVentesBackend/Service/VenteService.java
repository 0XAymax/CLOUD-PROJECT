package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Client;
import com.gestionVentesBackend.Model.Produit;
import com.gestionVentesBackend.Model.Vente;
import com.gestionVentesBackend.Model.VenteId;
import com.gestionVentesBackend.Repository.ClientRepository;
import com.gestionVentesBackend.Repository.ProduitRepository;
import com.gestionVentesBackend.Repository.VenteRepository;
import com.gestionVentesBackend.dto.VenteRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Ventes
 */
@Service
public class VenteService {

    @Autowired
    private VenteRepository venteRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private ClientRepository clientRepository;

    public List<Vente> getAllVentes() {
        return venteRepository.findAll();
    }

    public Optional<Vente> getVenteById(Long clientId, Integer produitId, LocalDate dateVente, LocalTime heureVente) {
        VenteId id = new VenteId(clientId, produitId, dateVente, heureVente);
        return venteRepository.findById(id);
    }

    @Transactional
    public Vente createVente(Vente vente) {
        // Définir la date et l'heure actuelles si non fournies
        if (vente.getDateVente() == null) {
            vente.setDateVente(LocalDate.now());
        }
        if (vente.getHeureVente() == null) {
            vente.setHeureVente(LocalTime.now());
        }

        // Charger les entités complètes depuis la base de données
        if (vente.getClient() != null && vente.getClient().getId() != null) {
            Client client = clientRepository.findById(vente.getClient().getId())
                    .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'ID: " + vente.getClient().getId()));
            vente.setClient(client);
        }

        if (vente.getProduit() != null && vente.getProduit().getId() != null) {
            Produit produit = produitRepository.findById(vente.getProduit().getId())
                    .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + vente.getProduit().getId()));
            
            // Vérifier si le stock est suffisant
            Integer stockActuel = produit.getQuantite() != null ? produit.getQuantite() : 0;
            if (stockActuel < vente.getQuantite()) {
                throw new RuntimeException("Stock insuffisant pour le produit " + produit.getNom() + 
                    ". Stock disponible: " + stockActuel + ", Quantité demandée: " + vente.getQuantite());
            }

            // Décrémenter la quantité du produit
            produit.setQuantite(stockActuel - vente.getQuantite());
            produitRepository.save(produit);
            
            vente.setProduit(produit);
        }

        return venteRepository.save(vente);
    }

    @Transactional
    public Vente updateVente(Long clientId, Integer produitId, LocalDate dateVente, LocalTime heureVente, Vente venteDetails) {
        VenteId id = new VenteId(clientId, produitId, dateVente, heureVente);
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vente non trouvée"));
        
        if (venteDetails.getQuantite() != null && !venteDetails.getQuantite().equals(vente.getQuantite())) {
            // Calculer la différence de quantité
            int difference = venteDetails.getQuantite() - vente.getQuantite();
            
            // Mettre à jour le stock du produit
            Produit produit = vente.getProduit();
            Integer stockActuel = produit.getQuantite() != null ? produit.getQuantite() : 0;
            
            // Si on augmente la quantité vendue, il faut plus de stock
            if (difference > 0 && stockActuel < difference) {
                throw new RuntimeException("Stock insuffisant pour augmenter la quantité. Stock disponible: " + stockActuel);
            }
            
            // Ajuster le stock (si on diminue la quantité vendue, on rajoute au stock, et vice versa)
            produit.setQuantite(stockActuel - difference);
            produitRepository.save(produit);
            
            vente.setQuantite(venteDetails.getQuantite());
        }
        
        return venteRepository.save(vente);
    }

    @Transactional
    public void deleteVente(Long clientId, Integer produitId, LocalDate dateVente, LocalTime heureVente) {
        VenteId id = new VenteId(clientId, produitId, dateVente, heureVente);
        
        // Récupérer la vente avant de la supprimer pour restaurer le stock
        Vente vente = venteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vente non trouvée"));
        
        // Restaurer la quantité au stock du produit
        Produit produit = vente.getProduit();
        Integer stockActuel = produit.getQuantite() != null ? produit.getQuantite() : 0;
        produit.setQuantite(stockActuel + vente.getQuantite());
        produitRepository.save(produit);
        
        // Supprimer la vente
        venteRepository.deleteById(id);
    }

    public List<Vente> getVentesByClient(Long clientId) {
        return venteRepository.findByClientId(clientId);
    }

    public List<Vente> getVentesByProduit(Integer produitId) {
        return venteRepository.findByProduitId(produitId);
    }

    public Double getTotalVentesByClientId(Long clientId) {
        List<Vente> ventes = getVentesByClient(clientId);
        return ventes.stream()
                .mapToDouble(v -> v.getProduit().getPrix() * v.getQuantite())
                .sum();
    }

    public Long getCountVentesByClientId(Long clientId) {
        return (long) getVentesByClient(clientId).size();
    }

    /**
     * Crée une vente à partir d'un DTO
     */
    @Transactional
    public Vente createVenteFromDTO(VenteRequestDTO dto) {
        // Récupérer le client
        Client client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client non trouvé avec l'ID: " + dto.getClientId()));

        // Récupérer le produit
        Produit produit = produitRepository.findById(dto.getProduitId())
                .orElseThrow(() -> new RuntimeException("Produit non trouvé avec l'ID: " + dto.getProduitId()));

        // Vérifier le stock
        Integer stockActuel = produit.getQuantite() != null ? produit.getQuantite() : 0;
        if (stockActuel < dto.getQuantite()) {
            throw new RuntimeException("Stock insuffisant pour le produit " + produit.getNom() + 
                ". Stock disponible: " + stockActuel + ", Quantité demandée: " + dto.getQuantite());
        }

        // Convertir les dates/heures
        LocalDate dateVente = LocalDate.parse(dto.getDateVente(), DateTimeFormatter.ISO_LOCAL_DATE);
        LocalTime heureVente = LocalTime.parse(dto.getHeureVente(), DateTimeFormatter.ISO_LOCAL_TIME);

        // Créer la vente
        Vente vente = new Vente();
        vente.setClient(client);
        vente.setProduit(produit);
        vente.setDateVente(dateVente);
        vente.setHeureVente(heureVente);
        vente.setQuantite(dto.getQuantite());

        // Décrémenter le stock
        produit.setQuantite(stockActuel - dto.getQuantite());
        produitRepository.save(produit);

        return venteRepository.save(vente);
    }
}
