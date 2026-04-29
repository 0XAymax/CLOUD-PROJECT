package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Model.Produit;
import com.gestionVentesBackend.Model.Categorie;
import com.gestionVentesBackend.Repository.ProduitRepository;
import com.gestionVentesBackend.Repository.CategorieRepository;
import com.gestionVentesBackend.dto.RatingUpdateDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.*;

@RestController
@RequestMapping("/produits")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:4200"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
        allowedHeaders = "*",
        allowCredentials = "true",
        maxAge = 3600
)
public class ProduitController {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;

    public ProduitController(ProduitRepository produitRepository, CategorieRepository categorieRepository) {
        this.produitRepository = produitRepository;
        this.categorieRepository = categorieRepository;
    }

    // GET /produits - Récupérer tous les produits
    @GetMapping
    public ResponseEntity<List<Produit>> getProduits() {
        try {
            System.out.println("📥 Récupération de tous les produits");
            List<Produit> produits = produitRepository.findAll();
            System.out.println("✅ " + produits.size() + " produits trouvés");
            produits.forEach(p -> System.out.println("  - " + p.getNom() + " (" + p.getPrix() + "€)"));
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /produits/search?nom=... - Rechercher par nom
    @GetMapping("/search")
    public ResponseEntity<List<Produit>> searchProduits(@RequestParam String nom) {
        try {
            System.out.println("🔍 Recherche de produits avec le terme: " + nom);
            List<Produit> produits = produitRepository.findByNomContainingIgnoreCase(nom);
            System.out.println("✅ " + produits.size() + " produits trouvés pour la recherche");
            return ResponseEntity.ok(produits);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la recherche: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // GET /produits/{id} - Récupérer un produit par ID
    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Integer id) {
        try {
            System.out.println("📥 Récupération du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        System.out.println("✅ Produit trouvé: " + produit.getNom());
                        return ResponseEntity.ok(produit);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la récupération: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /produits - Créer un nouveau produit
    @PostMapping
    public ResponseEntity<?> createProduit(@RequestBody Produit produit) {
        try {
            System.out.println("➕ Création d'un nouveau produit: " + produit.getNom());
            
            // Validation des champs obligatoires
            if (produit.getNom() == null || produit.getNom().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le nom du produit est obligatoire");
            }
            if (produit.getPrix() == null || produit.getPrix() <= 0) {
                return ResponseEntity.badRequest().body("Le prix doit être supérieur à 0");
            }
            if (produit.getQuantite() == null || produit.getQuantite() < 0) {
                return ResponseEntity.badRequest().body("La quantité ne peut pas être négative");
            }
            
            // Si une catégorie est fournie avec un ID, charger la catégorie complète
            if (produit.getCategorie() != null && produit.getCategorie().getId() != null) {
                Categorie categorie = categorieRepository.findById(produit.getCategorie().getId())
                        .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + produit.getCategorie().getId()));
                produit.setCategorie(categorie);
            }
            
            Produit saved = produitRepository.save(produit);
            System.out.println("✅ Produit créé avec l'ID: " + saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la création: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // PUT /produits/{id} - Mettre à jour un produit
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduit(@PathVariable Integer id, @RequestBody Produit produitDetails) {
        try {
            System.out.println("🔄 Mise à jour du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        // Validations
                        if (produitDetails.getNom() != null) {
                            if (produitDetails.getNom().trim().isEmpty()) {
                                throw new RuntimeException("Le nom du produit ne peut pas être vide");
                            }
                            produit.setNom(produitDetails.getNom());
                        }
                        if (produitDetails.getPrix() != null) {
                            if (produitDetails.getPrix() <= 0) {
                                throw new RuntimeException("Le prix doit être supérieur à 0");
                            }
                            produit.setPrix(produitDetails.getPrix());
                        }
                        if (produitDetails.getQuantite() != null) {
                            if (produitDetails.getQuantite() < 0) {
                                throw new RuntimeException("La quantité ne peut pas être négative");
                            }
                            produit.setQuantite(produitDetails.getQuantite());
                        }
                        
                        // Autres champs
                        if (produitDetails.getDescription() != null) produit.setDescription(produitDetails.getDescription());
                        if (produitDetails.getImage() != null) produit.setImage(produitDetails.getImage());
                        if (produitDetails.getRank() != null) produit.setRank(produitDetails.getRank());
                        if (produitDetails.getRating() != null) produit.setRating(produitDetails.getRating());
                        if (produitDetails.getReviews_count() != null) produit.setReviews_count(produitDetails.getReviews_count());
                        
                        // Gestion de la catégorie
                        if (produitDetails.getCategorie() != null && produitDetails.getCategorie().getId() != null) {
                            Categorie categorie = categorieRepository.findById(produitDetails.getCategorie().getId())
                                    .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + produitDetails.getCategorie().getId()));
                            produit.setCategorie(categorie);
                        }

                        Produit updated = produitRepository.save(produit);
                        System.out.println("✅ Produit mis à jour: " + updated.getNom());
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la mise à jour: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // DELETE /produits/{id} - Supprimer un produit
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduit(@PathVariable Integer id) {
        try {
            System.out.println("🗑️ Suppression du produit ID: " + id);
            return produitRepository.findById(id)
                    .map(produit -> {
                        try {
                            produitRepository.delete(produit);
                            System.out.println("✅ Produit supprimé: " + produit.getNom());
                            return ResponseEntity.ok().body("Produit supprimé avec succès");
                        } catch (Exception e) {
                            System.err.println("❌ Erreur lors de la suppression (contrainte FK): " + e.getMessage());
                            return ResponseEntity.badRequest().body("Impossible de supprimer ce produit car il est référencé dans des ventes ou investissements");
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la suppression: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // PATCH /produits/{id}/rating - Mettre à jour le rating d'un produit
    @PatchMapping("/{id}/rating")
    public ResponseEntity<?> updateRating(@PathVariable Integer id, @RequestBody RatingUpdateDTO request) {
        try {
            System.out.println("⭐ Mise à jour du rating pour le produit ID: " + id);
            
            return produitRepository.findById(id)
                    .map(produit -> {
                        Double currentRating = produit.getRating();
                        Double newRating = request.getRating();
                        
                        // Valider que le rating est entre 1 et 5
                        if (newRating < 1 || newRating > 5) {
                            return ResponseEntity.badRequest().body("Le rating doit être entre 1 et 5");
                        }
                        
                        // Si le produit a déjà un rating, faire la moyenne
                        if (currentRating != null && currentRating > 0) {
                            newRating = (currentRating + newRating) / 2.0;
                            System.out.println("��� Ancien rating: " + currentRating + ", Nouveau: " + request.getRating() + ", Moyenne: " + newRating);
                        } else {
                            System.out.println("��� Premier rating: " + newRating);
                        }
                        
                        produit.setRating(newRating);
                        Produit updatedProduit = produitRepository.save(produit);
                        System.out.println("✅ Rating mis à jour pour: " + updatedProduit.getNom());
                        
                        return ResponseEntity.ok(updatedProduit);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de la mise à jour du rating: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }

    // POST /api/produits/import-csv - Importer des produits depuis un fichier CSV
    @PostMapping("/api/produits/import-csv")
    public ResponseEntity<?> importProductsFromCsv(@RequestParam("file") MultipartFile file) {
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        
        try {
            System.out.println("📁 Import CSV de produits: " + file.getOriginalFilename());
            
            // Validation du fichier
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "Le fichier est vide");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!file.getOriginalFilename().endsWith(".csv")) {
                response.put("success", false);
                response.put("error", "Le fichier doit être au format CSV");
                return ResponseEntity.badRequest().body(response);
            }
            
            int totalRows = 0;
            int insertedRows = 0;
            int updatedRows = 0;
            int errorRows = 0;
            
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                String line;
                String[] headers = null;
                int lineNumber = 0;
                
                while ((line = reader.readLine()) != null) {
                    lineNumber++;
                    
                    // Première ligne = en-têtes
                    if (lineNumber == 1) {
                        headers = line.split(",");
                        System.out.println("📋 En-têtes détectés: " + String.join(", ", headers));
                        
                        // Vérifier les colonnes obligatoires
                        List<String> headerList = Arrays.asList(headers);
                        if (!headerList.contains("nom") || !headerList.contains("prix") || 
                            !headerList.contains("stock") || !headerList.contains("categorie")) {
                            response.put("success", false);
                            response.put("error", "Le CSV doit contenir les colonnes: nom, prix, stock, categorie");
                            return ResponseEntity.badRequest().body(response);
                        }
                        continue;
                    }
                    
                    totalRows++;
                    
                    try {
                        // Parser la ligne CSV
                        String[] values = line.split(",", -1); // -1 pour garder les valeurs vides
                        
                        if (values.length < headers.length) {
                            throw new RuntimeException("Nombre de colonnes insuffisant");
                        }
                        
                        // Créer un map des valeurs
                        Map<String, String> data = new HashMap<>();
                        for (int i = 0; i < headers.length; i++) {
                            data.put(headers[i].trim(), values[i].trim());
                        }
                        
                        // Extraction et transformation (ETL)
                        String nom = data.get("nom");
                        if (nom == null || nom.isEmpty()) {
                            throw new RuntimeException("Le nom est obligatoire");
                        }
                        
                        // Nettoyage du nom (suppression des espaces multiples, trim)
                        nom = nom.replaceAll("\\s+", " ").trim();
                        
                        Double prix;
                        try {
                            prix = Double.parseDouble(data.get("prix"));
                            if (prix <= 0) throw new RuntimeException("Le prix doit être positif");
                        } catch (NumberFormatException e) {
                            throw new RuntimeException("Prix invalide: " + data.get("prix"));
                        }
                        
                        Integer stock;
                        try {
                            stock = Integer.parseInt(data.get("stock"));
                            if (stock < 0) throw new RuntimeException("Le stock ne peut pas être négatif");
                        } catch (NumberFormatException e) {
                            throw new RuntimeException("Stock invalide: " + data.get("stock"));
                        }
                        
                        String categorieNom = data.get("categorie");
                        if (categorieNom == null || categorieNom.isEmpty()) {
                            throw new RuntimeException("La catégorie est obligatoire");
                        }
                        
                        // Chercher la catégorie
                        Categorie categorie = categorieRepository.findByNomIgnoreCase(categorieNom.trim());
                        if (categorie == null) {
                            throw new RuntimeException("Catégorie non trouvée: " + categorieNom);
                        }
                        
                        // Champs optionnels
                        String description = data.getOrDefault("description", "");
                        String image = data.getOrDefault("image", "");
                        Integer seuilAlerte = null;
                        if (data.containsKey("seuilAlerte") && !data.get("seuilAlerte").isEmpty()) {
                            try {
                                seuilAlerte = Integer.parseInt(data.get("seuilAlerte"));
                            } catch (NumberFormatException e) {
                                // Ignorer si invalide
                            }
                        }
                        
                        // Vérifier si le produit existe déjà (par nom)
                        List<Produit> existingProducts = produitRepository.findByNomContainingIgnoreCase(nom);
                        Produit produit = null;
                        boolean isUpdate = false;
                        
                        for (Produit p : existingProducts) {
                            if (p.getNom().equalsIgnoreCase(nom)) {
                                produit = p;
                                isUpdate = true;
                                break;
                            }
                        }
                        
                        if (produit == null) {
                            produit = new Produit();
                        }
                        
                        // Load (chargement dans la base)
                        produit.setNom(nom);
                        produit.setPrix(prix);
                        produit.setQuantite(stock);
                        produit.setCategorie(categorie);
                        
                        if (!description.isEmpty()) produit.setDescription(description);
                        if (!image.isEmpty()) produit.setImage(image);
                        
                        produitRepository.save(produit);
                        
                        if (isUpdate) {
                            updatedRows++;
                            System.out.println("🔄 Produit mis à jour: " + nom);
                        } else {
                            insertedRows++;
                            System.out.println("➕ Produit créé: " + nom);
                        }
                        
                    } catch (Exception e) {
                        errorRows++;
                        Map<String, Object> error = new HashMap<>();
                        error.put("row", lineNumber);
                        error.put("error", e.getMessage());
                        errors.add(error);
                        System.err.println("❌ Erreur ligne " + lineNumber + ": " + e.getMessage());
                    }
                }
            }
            
            System.out.println("✅ Import terminé - Total: " + totalRows + ", Insérés: " + insertedRows + 
                             ", Mis à jour: " + updatedRows + ", Erreurs: " + errorRows);
            
            response.put("success", true);
            response.put("message", "Import terminé avec succès");
            response.put("totalRows", totalRows);
            response.put("insertedRows", insertedRows);
            response.put("updatedRows", updatedRows);
            response.put("errorRows", errorRows);
            
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'import CSV: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("error", "Erreur lors de l'import: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
