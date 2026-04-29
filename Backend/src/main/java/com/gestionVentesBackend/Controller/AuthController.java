package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Client;
import com.gestionVentesBackend.Model.Employe;
import com.gestionVentesBackend.Model.Investisseur;
import com.gestionVentesBackend.Model.Personne;
import com.gestionVentesBackend.Repository.ClientRepository;
import com.gestionVentesBackend.Repository.EmployeRepository;
import com.gestionVentesBackend.Repository.InvestisseurRepository;
import com.gestionVentesBackend.Repository.PersonneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller REST pour l'authentification
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.cors.origins}")
public class AuthController {

    @Autowired
    private PersonneRepository personneRepository;

    @Autowired
    private EmployeRepository employeRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private InvestisseurRepository investisseurRepository;

    /**
     * Endpoint de connexion
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Chercher la personne par email
            Optional<Personne> personneOpt = personneRepository.findByEmail(request.getEmail());

            if (personneOpt.isEmpty()) {
                return ResponseEntity.status(401).body(createError("Email ou mot de passe incorrect"));
            }

            Personne personne = personneOpt.get();

            // Vérifier le mot de passe (en production, utilisez BCrypt)
            if (!personne.getPassword().equals(request.getPassword())) {
                return ResponseEntity.status(401).body(createError("Email ou mot de passe incorrect"));
            }

            // Déterminer le rôle et créer la réponse
            String role = "client";
            String roleName = "Client";

            if (personne instanceof Employe) {
                Employe employe = (Employe) personne;
                roleName = employe.getRole().getNameRole();
                
                // Mapper le nom du rôle vers les rôles frontend
                switch (roleName.toLowerCase()) {
                    case "admin":
                    case "administrateur":
                        role = "admin";
                        break;
                    case "vendeur":
                        role = "vendeur";
                        break;
                    case "analyste":
                        role = "analyste";
                        break;
                    default:
                        role = "vendeur"; // Par défaut pour les employés
                }
            } else if (personne instanceof Investisseur) {
                role = "investisseur";
                roleName = "Investisseur";
            }

            // Créer un token simple (en production, utilisez JWT)
            String token = "token_" + personne.getId() + "_" + System.currentTimeMillis();

            // Créer la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("id", personne.getId());
            response.put("name", personne.getPrenom() + " " + personne.getNom());
            response.put("email", personne.getEmail());
            response.put("role", role);
            response.put("roleName", roleName);
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(createError("Erreur serveur: " + e.getMessage()));
        }
    }

    /**
     * Endpoint d'inscription
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            // Vérifier si l'email existe déjà
            if (personneRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(400).body(createError("Cet email est déjà utilisé"));
            }

            Personne personne;

            switch (request.getUserType().toLowerCase()) {
                case "client":
                    Client client = new Client();
                    client.setNom(request.getNom());
                    client.setPrenom(request.getPrenom());
                    client.setEmail(request.getEmail());
                    client.setPassword(request.getPassword());
                    client.setNumeroTel(request.getTelephone());
                    client.setAddress(request.getAdresse());
                    if (request.getPhotoUrl() != null) client.setPhotoUrl(request.getPhotoUrl());
                    personne = clientRepository.save(client);
                    break;

                case "employe":
                    // Bloquer l'inscription des employés
                    return ResponseEntity.status(403).body(createError("L'inscription des employés n'est pas autorisée. Veuillez contacter l'administrateur."));

                case "investisseur":
                    Investisseur investisseur = new Investisseur();
                    investisseur.setNom(request.getNom());
                    investisseur.setPrenom(request.getPrenom());
                    investisseur.setEmail(request.getEmail());
                    investisseur.setPassword(request.getPassword());
                    investisseur.setNumeroTel(request.getTelephone());
                    investisseur.setAddress(request.getAdresse());
                    if (request.getPhotoUrl() != null) investisseur.setPhotoUrl(request.getPhotoUrl());

                    // Champs spécifiques investisseur (optionnels)
                    if (request.getIce() != null) investisseur.setIce(request.getIce());
                    if (request.getNomEntreprise() != null) investisseur.setNom_entreprise(request.getNomEntreprise());
                    if (request.getAdresseEntreprise() != null) investisseur.setAdresse_entreprise(request.getAdresseEntreprise());
                    if (request.getNumeroEntreprise() != null) investisseur.setNumero_entreprise(request.getNumeroEntreprise());
                    if (request.getEmailEntreprise() != null) investisseur.setEmail_entreprise(request.getEmailEntreprise());
                    if (request.getLogoUrl() != null) investisseur.setLogo_url(request.getLogoUrl());
                    if (request.getDomaineEntreprise() != null) investisseur.setDomaine_entreprise(request.getDomaineEntreprise());
                    if (request.getCapitalDisponible() != null) investisseur.setCapitalDisponible(request.getCapitalDisponible());
                    personne = investisseurRepository.save(investisseur);
                    break;

                default:
                    return ResponseEntity.status(400).body(createError("Type d'utilisateur invalide"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inscription réussie");
            response.put("id", personne.getId());
            response.put("email", personne.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(createError("Erreur serveur: " + e.getMessage()));
        }
    }

    /**
     * Endpoint pour obtenir l'utilisateur actuel (optionnel)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // Cette fonctionnalité nécessite une vraie gestion de tokens
        return ResponseEntity.status(501).body(createError("Fonctionnalité non implémentée"));
    }

    private Map<String, String> createError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }

    // Classes internes pour les requêtes
    static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    static class SignupRequest {
        private String nom;
        private String prenom;
        private String email;
        private String password;
        private String telephone;
        private String adresse;
        private String userType; // "client", "employe", "investisseur"

        // Personne (optionnel)
        private String photoUrl;

        // Investisseur (optionnels)
        private String ice;
        private String nomEntreprise;
        private String adresseEntreprise;
        private String numeroEntreprise;
        private String emailEntreprise;
        private String logoUrl;
        private String domaineEntreprise;
        private Double capitalDisponible;

        public String getNom() {
            return nom;
        }

        public void setNom(String nom) {
            this.nom = nom;
        }

        public String getPrenom() {
            return prenom;
        }

        public void setPrenom(String prenom) {
            this.prenom = prenom;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getTelephone() {
            return telephone;
        }

        public void setTelephone(String telephone) {
            this.telephone = telephone;
        }

        public String getAdresse() {
            return adresse;
        }

        public void setAdresse(String adresse) {
            this.adresse = adresse;
        }

        public String getUserType() {
            return userType;
        }

        public void setUserType(String userType) {
            this.userType = userType;
        }

        public String getPhotoUrl() {
            return photoUrl;
        }

        public void setPhotoUrl(String photoUrl) {
            this.photoUrl = photoUrl;
        }

        public String getIce() {
            return ice;
        }

        public void setIce(String ice) {
            this.ice = ice;
        }

        public String getNomEntreprise() {
            return nomEntreprise;
        }

        public void setNomEntreprise(String nomEntreprise) {
            this.nomEntreprise = nomEntreprise;
        }

        public String getAdresseEntreprise() {
            return adresseEntreprise;
        }

        public void setAdresseEntreprise(String adresseEntreprise) {
            this.adresseEntreprise = adresseEntreprise;
        }

        public String getNumeroEntreprise() {
            return numeroEntreprise;
        }

        public void setNumeroEntreprise(String numeroEntreprise) {
            this.numeroEntreprise = numeroEntreprise;
        }

        public String getEmailEntreprise() {
            return emailEntreprise;
        }

        public void setEmailEntreprise(String emailEntreprise) {
            this.emailEntreprise = emailEntreprise;
        }

        public String getLogoUrl() {
            return logoUrl;
        }

        public void setLogoUrl(String logoUrl) {
            this.logoUrl = logoUrl;
        }

        public String getDomaineEntreprise() {
            return domaineEntreprise;
        }

        public void setDomaineEntreprise(String domaineEntreprise) {
            this.domaineEntreprise = domaineEntreprise;
        }

        public Double getCapitalDisponible() {
            return capitalDisponible;
        }

        public void setCapitalDisponible(Double capitalDisponible) {
            this.capitalDisponible = capitalDisponible;
        }
    }
}
