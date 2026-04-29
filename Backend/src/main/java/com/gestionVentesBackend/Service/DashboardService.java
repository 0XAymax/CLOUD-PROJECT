package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Vente;
import com.gestionVentesBackend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private VenteRepository venteRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    // 🔴 Toutes les statistiques (AVEC TES CHAMPS EXISTANTS)
    public Map<String, Object> getAllStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Totaux basiques (comme avant)
        stats.put("totalProduits", produitRepository.count());
        stats.put("totalClients", clientRepository.count());
        stats.put("totalVentes", venteRepository.count());
        stats.put("totalCategories", categorieRepository.count());

        // 2. Prix moyen
        double prixMoyen = produitRepository.findAll().stream()
                .filter(p -> p.getPrix() != null)
                .mapToDouble(p -> p.getPrix())
                .average()
                .orElse(0.0);
        stats.put("prixMoyen", prixMoyen);

        // 3. Produits en faible stock (< 5) - UTILISE SEULEMENT quantite
        long produitsFaibleStock = produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null && p.getQuantite() < 5)
                .count();
        stats.put("produitsFaibleStock", produitsFaibleStock);

        // 4. Chiffre d'affaires total
        double chiffreAffaires = venteRepository.findAll().stream()
                .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                .sum();
        stats.put("chiffreAffaires", chiffreAffaires);

        // 5. Top 5 produits (par nom)
        List<Map<String, Object>> topProduits = new ArrayList<>();
        produitRepository.findAll().stream()
                .limit(5)
                .forEach(p -> {
                    Map<String, Object> prod = new HashMap<>();
                    prod.put("id", p.getId());
                    prod.put("nom", p.getNom());
                    prod.put("prix", p.getPrix());
                    prod.put("stock", p.getQuantite());
                    prod.put("description", p.getDescription());
                    prod.put("image", p.getImage());
                    prod.put("categorie", p.getCategorie() != null ? p.getCategorie().getNom() : "Non catégorisé");

                    // Calculer le nombre de ventes pour ce produit
                    long nbVentes = venteRepository.findAll().stream()
                            .filter(v -> v.getProduit() != null && v.getProduit().getId().equals(p.getId()))
                            .mapToLong(v -> v.getQuantite())
                            .sum();
                    prod.put("nombreVentes", nbVentes);

                    // Calculer le CA pour ce produit
                    double caProduit = venteRepository.findAll().stream()
                            .filter(v -> v.getProduit() != null && v.getProduit().getId().equals(p.getId()))
                            .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                            .sum();
                    prod.put("chiffreAffaires", caProduit);

                    topProduits.add(prod);
                });
        stats.put("top5Produits", topProduits);

        // 6. Distribution par catégorie (simplifié)
        List<Map<String, Object>> categories = new ArrayList<>();
        categorieRepository.findAll().forEach(c -> {
            Map<String, Object> cat = new HashMap<>();
            cat.put("nom", c.getNom());
            cat.put("nbProduits", produitRepository.findByCategorie(c).size());

            // Calculer le CA par catégorie
            double caCategorie = produitRepository.findByCategorie(c).stream()
                    .flatMap(p -> venteRepository.findAll().stream()
                            .filter(v -> v.getProduit() != null && v.getProduit().getId().equals(p.getId())))
                    .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                    .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                    .sum();
            cat.put("chiffreAffaires", caCategorie);

            categories.add(cat);
        });
        stats.put("distributionCategories", categories);

        // 7. Dernières ventes (10 dernières)
        List<Map<String, Object>> dernieresVentes = new ArrayList<>();
        venteRepository.findAll().stream()
                .sorted((v1, v2) -> v2.getDateVente().compareTo(v1.getDateVente()))
                .limit(10)
                .forEach(v -> {
                    Map<String, Object> vente = new HashMap<>();
                    vente.put("id", String.format("vente-%d-%d-%s-%s",
                            v.getClient() != null ? v.getClient().getId() : 0,
                            v.getProduit() != null ? v.getProduit().getId() : 0,
                            v.getDateVente(),
                            v.getHeureVente()));
                    vente.put("produit", v.getProduit() != null ? v.getProduit().getNom() : "N/A");
                    vente.put("client", v.getClient() != null ?
                            v.getClient().getPrenom() + " " + v.getClient().getNom() : "N/A");
                    vente.put("quantite", v.getQuantite());
                    vente.put("prixUnitaire", v.getProduit() != null ? v.getProduit().getPrix() : 0);
                    vente.put("montantTotal", v.getQuantite() * (v.getProduit() != null ? v.getProduit().getPrix() : 0));
                    vente.put("date", v.getDateVente());
                    dernieresVentes.add(vente);
                });
        stats.put("dernieresVentes", dernieresVentes);

        return stats;
    }

    // 🔴 Statistiques rapides
    public Map<String, Object> getQuickStats() {
        Map<String, Object> stats = new HashMap<>();

        // Ventes d'aujourd'hui
        long ventesAujourdhui = venteRepository.findAll().stream()
                .filter(v -> v.getDateVente() != null &&
                        v.getDateVente().equals(LocalDate.now()))
                .count();

        stats.put("ventesAujourdhui", ventesAujourdhui);
        stats.put("produitsTotal", produitRepository.count());
        stats.put("clientsTotal", clientRepository.count());
        stats.put("categoriesTotal", categorieRepository.count());

        return stats;
    }

    public Map<String, Object> getStatsFiltrees(LocalDate dateDebut, LocalDate dateFin) {
        Map<String, Object> stats = new HashMap<>();

        List<Vente> ventesFiltrees = venteRepository.findAll().stream()
                .filter(v -> {
                    if (dateDebut == null && dateFin == null) return true;
                    if (dateDebut != null && v.getDateVente().isBefore(dateDebut)) return false;
                    if (dateFin != null && v.getDateVente().isAfter(dateFin)) return false;
                    return true;
                })
                .toList();

        // Calculer les stats avec les ventes filtrées
        double chiffreAffaires = ventesFiltrees.stream()
                .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                .sum();

        stats.put("chiffreAffaires", chiffreAffaires);
        stats.put("nombreVentes", ventesFiltrees.size());
        stats.put("dateDebut", dateDebut != null ? dateDebut.toString() : "Toutes");
        stats.put("dateFin", dateFin != null ? dateFin.toString() : "Toutes");

        return stats;
    }

    public List<Map<String, Object>> getTopClients(int limit) {
        List<Map<String, Object>> result = new ArrayList<>();

        Map<String, Double> caParClient = new HashMap<>();
        Map<String, Integer> ventesParClient = new HashMap<>();

        venteRepository.findAll().forEach(vente -> {
            if (vente.getClient() != null) {
                String nomClient = vente.getClient().getPrenom() + " " + vente.getClient().getNom();
                double ca = caParClient.getOrDefault(nomClient, 0.0) +
                        (vente.getQuantite() * vente.getProduit().getPrix());
                caParClient.put(nomClient, ca);

                int nbVentes = ventesParClient.getOrDefault(nomClient, 0) + 1;
                ventesParClient.put(nomClient, nbVentes);
            }
        });

        caParClient.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .forEach(entry -> {
                    Map<String, Object> client = new HashMap<>();
                    client.put("nom", entry.getKey());
                    client.put("chiffreAffaires", entry.getValue());
                    client.put("nombreVentes", ventesParClient.get(entry.getKey()));
                    result.add(client);
                });

        return result;
    }

    public List<Map<String, Object>> getTopProduitsVendus(int limit) {
        List<Map<String, Object>> result = new ArrayList<>();

        Map<String, Integer> quantiteParProduit = new HashMap<>();
        Map<String, Double> caParProduit = new HashMap<>();

        venteRepository.findAll().forEach(vente -> {
            if (vente.getProduit() != null) {
                String nomProduit = vente.getProduit().getNom();
                int quantite = quantiteParProduit.getOrDefault(nomProduit, 0) + vente.getQuantite();
                quantiteParProduit.put(nomProduit, quantite);

                double ca = caParProduit.getOrDefault(nomProduit, 0.0) +
                        (vente.getQuantite() * vente.getProduit().getPrix());
                caParProduit.put(nomProduit, ca);
            }
        });

        quantiteParProduit.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(limit)
                .forEach(entry -> {
                    Map<String, Object> produit = new HashMap<>();
                    produit.put("nom", entry.getKey());
                    produit.put("quantiteVendue", entry.getValue());
                    produit.put("chiffreAffaires", caParProduit.get(entry.getKey()));
                    result.add(produit);
                });

        return result;
    }

    // 🔴 NOUVELLES MÉTHODES POUR LE DASHBOARD AVANCÉ

    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new HashMap<>();

        // 1. Taux de conversion (simulé - basé sur les ventes/visites)
        double totalVentes = venteRepository.count();
        double tauxConversion = (totalVentes / 1000) * 100; // 1000 visites simulées
        kpis.put("conversionRate", Math.min(Math.round(tauxConversion * 10.0) / 10.0, 10.0));

        // 2. Valeur moyenne du panier
        double totalCA = venteRepository.findAll().stream()
                .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                .sum();
        double avgOrderValue = totalVentes > 0 ? totalCA / totalVentes : 0;
        kpis.put("averageOrderValue", Math.round(avgOrderValue * 100.0) / 100.0);

        // 3. Taux de rétention (simulé - clients avec >1 commande)
        Map<Long, Integer> commandesParClient = new HashMap<>();
        venteRepository.findAll().forEach(v -> {
            if (v.getClient() != null) {
                Long clientId = v.getClient().getId();
                commandesParClient.put(clientId, commandesParClient.getOrDefault(clientId, 0) + 1);
            }
        });

        long clientsFideles = commandesParClient.values().stream()
                .filter(count -> count > 1)
                .count();
        double tauxRetention = commandesParClient.size() > 0 ?
                ((double) clientsFideles / commandesParClient.size()) * 100 : 0;
        kpis.put("customerRetention", Math.round(tauxRetention * 10.0) / 10.0);

        // 4. NPS Score (simulé)
        double npsScore = 8.2; // Valeur fixe pour l'instant
        kpis.put("npsScore", npsScore);

        // 5. Taux de croissance (mois précédent vs ce mois)
        LocalDate now = LocalDate.now();
        LocalDate lastMonth = now.minusMonths(1);

        double caCeMois = venteRepository.findAll().stream()
                .filter(v -> v.getDateVente() != null &&
                        v.getDateVente().getMonth() == now.getMonth() &&
                        v.getDateVente().getYear() == now.getYear())
                .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                .sum();

        double caMoisPrecedent = venteRepository.findAll().stream()
                .filter(v -> v.getDateVente() != null &&
                        v.getDateVente().getMonth() == lastMonth.getMonth() &&
                        v.getDateVente().getYear() == lastMonth.getYear())
                .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                .sum();

        double tauxCroissance = caMoisPrecedent > 0 ?
                ((caCeMois - caMoisPrecedent) / caMoisPrecedent) * 100 : 0;
        kpis.put("growthRate", Math.round(tauxCroissance * 10.0) / 10.0);

        // 6. Marge bénéficiaire (simulée - 30% par défaut)
        kpis.put("profitMargin", 30.0);

        return kpis;
    }

    public List<Map<String, Object>> getVentesMensuelles(int year) {
        List<Map<String, Object>> monthlySales = new ArrayList<>();

        String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                "Jul", "Août", "Sep", "Oct", "Nov", "Dec"};

        for (int i = 0; i < 12; i++) {
            final int monthIndex = i + 1;

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("mois", months[i]);

            // Calculer le CA réel pour ce mois
            double revenue = venteRepository.findAll().stream()
                    .filter(v -> v.getDateVente() != null &&
                            v.getDateVente().getMonthValue() == monthIndex &&
                            v.getDateVente().getYear() == year &&
                            v.getProduit() != null && v.getProduit().getPrix() != null)
                    .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                    .sum();

            // Calculer le nombre de ventes pour ce mois
            long sales = venteRepository.findAll().stream()
                    .filter(v -> v.getDateVente() != null &&
                            v.getDateVente().getMonthValue() == monthIndex &&
                            v.getDateVente().getYear() == year)
                    .count();

            monthData.put("ca", revenue);
            monthData.put("ventes", sales);

            monthlySales.add(monthData);
        }

        return monthlySales;
    }

    public List<Map<String, Object>> getTendances() {
        List<Map<String, Object>> trends = new ArrayList<>();

        String[] days = {"Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"};

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6); // 7 derniers jours

        for (int i = 0; i < 7; i++) {
            LocalDate day = weekStart.plusDays(i);

            // Calculer le CA pour ce jour
            double dayRevenue = venteRepository.findAll().stream()
                    .filter(v -> v.getDateVente() != null && v.getDateVente().equals(day))
                    .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                    .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                    .sum();

            // Calculer le changement vs jour précédent
            double prevDayRevenue = 0;
            if (i > 0) {
                LocalDate prevDay = day.minusDays(1);
                prevDayRevenue = venteRepository.findAll().stream()
                        .filter(v -> v.getDateVente() != null && v.getDateVente().equals(prevDay))
                        .filter(v -> v.getProduit() != null && v.getProduit().getPrix() != null)
                        .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                        .sum();
            }

            double change = prevDayRevenue > 0 ?
                    ((dayRevenue - prevDayRevenue) / prevDayRevenue) * 100 : 0;

            Map<String, Object> dayData = new HashMap<>();
            dayData.put("period", days[i]);
            dayData.put("value", Math.round(dayRevenue));
            dayData.put("change", Math.round(change * 10.0) / 10.0);
            trends.add(dayData);
        }

        return trends;
    }

    public Map<String, Object> getPerformances() {
        Map<String, Object> performances = new HashMap<>();

        List<Map<String, Object>> metrics = new ArrayList<>();

        // Calculer les vraies métriques
        double conversionRate = (double) getKPIs().get("conversionRate");
        double avgOrderValue = (double) getKPIs().get("averageOrderValue");
        double retentionRate = (double) getKPIs().get("customerRetention");

        // Satisfaction client (simulée)
        double satisfactionScore = 92.0;

        // Temps de livraison (simulé)
        double deliveryTime = 2.4;

        // Stock moyen
        double avgStock = produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null)
                .mapToDouble(p -> p.getQuantite())
                .average()
                .orElse(0.0);

        String[] metricNames = {
                "Taux de conversion",
                "Panier moyen",
                "Taux de rétention",
                "Satisfaction client",
                "Temps de livraison",
                "Stock moyen"
        };

        Double[] values = {conversionRate, avgOrderValue, retentionRate, satisfactionScore, deliveryTime, avgStock};
        Double[] targets = {5.0, 100.0, 80.0, 90.0, 2.0, 20.0};

        // Déterminer le statut
        String[] statuses = new String[6];
        for (int i = 0; i < 6; i++) {
            double ratio = values[i] / targets[i];
            if (ratio >= 1.0) {
                statuses[i] = "excellent";
            } else if (ratio >= 0.8) {
                statuses[i] = "good";
            } else if (ratio >= 0.6) {
                statuses[i] = "warning";
            } else {
                statuses[i] = "critical";
            }
        }

        for (int i = 0; i < metricNames.length; i++) {
            Map<String, Object> metric = new HashMap<>();
            metric.put("metric", metricNames[i]);
            metric.put("value", values[i]);
            metric.put("target", targets[i]);
            metric.put("status", statuses[i]);
            metric.put("progress", Math.min((values[i] / targets[i]) * 100, 100));
            metrics.add(metric);
        }

        performances.put("metrics", metrics);
        return performances;
    }

    public Map<String, Object> getStatistiquesStock() {
        Map<String, Object> stockStats = new HashMap<>();

        // Valeur totale du stock (prix * quantité)
        double totalStockValue = produitRepository.findAll().stream()
                .filter(p -> p.getPrix() != null && p.getQuantite() != null)
                .mapToDouble(p -> p.getPrix() * p.getQuantite())
                .sum();

        // Quantité moyenne en stock
        double avgStock = produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null)
                .mapToDouble(p -> p.getQuantite())
                .average()
                .orElse(0.0);

        // Taux de rotation (ventes / stock)
        double totalSales = venteRepository.findAll().stream()
                .mapToInt(v -> v.getQuantite())
                .sum();

        double totalStock = produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null)
                .mapToDouble(p -> p.getQuantite())
                .sum();

        double turnoverRate = totalStock > 0 ? totalSales / totalStock : 0;

        // Produits en rupture
        long stockOutCount = produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null && p.getQuantite() == 0)
                .count();

        stockStats.put("totalStockValue", Math.round(totalStockValue * 100.0) / 100.0);
        stockStats.put("averageStockAge", 45); // Simulé
        stockStats.put("turnoverRate", Math.round(turnoverRate * 10.0) / 10.0);
        stockStats.put("stockOutCount", stockOutCount);

        return stockStats;
    }

    // 🔴 NOUVELLE MÉTHODE: Évolution du CA
    public List<Map<String, Object>> getEvolutionCA(int nbMois) {
        List<Map<String, Object>> evolution = new ArrayList<>();

        LocalDate now = LocalDate.now();
        String[] monthNames = {"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                "Jul", "Août", "Sep", "Oct", "Nov", "Dec"};

        // Récupérer les données réelles au lieu de générer des mois futurs
        // On va d'abord récupérer tous les mois qui ont des données
        Map<String, Map<String, Object>> realData = new HashMap<>();

        venteRepository.findAll().forEach(vente -> {
            if (vente.getDateVente() != null && vente.getProduit() != null) {
                LocalDate date = vente.getDateVente();
                String key = date.getYear() + "-" + String.format("%02d", date.getMonthValue());

                Map<String, Object> existing = realData.getOrDefault(key, new HashMap<>());
                double currentCA = (double) existing.getOrDefault("chiffreAffaires", 0.0);
                long currentSales = (long) existing.getOrDefault("ventes", 0L);

                existing.put("chiffreAffaires", currentCA + (vente.getQuantite() * vente.getProduit().getPrix()));
                existing.put("ventes", currentSales + vente.getQuantite());
                existing.put("annee", date.getYear());
                existing.put("mois", monthNames[date.getMonthValue() - 1]);

                realData.put(key, existing);
            }
        });

        // Convertir en liste, trier et limiter
        List<Map<String, Object>> allData = new ArrayList<>(realData.values());

        // Trier du plus récent au plus ancien
        allData.sort((a, b) -> {
            int yearCompare = ((Integer) b.get("annee")).compareTo((Integer) a.get("annee"));
            if (yearCompare != 0) return yearCompare;

            // Pour comparer les mois, on a besoin de l'index
            String[] months = {"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                    "Jul", "Août", "Sep", "Oct", "Nov", "Dec"};
            String moisA = (String) a.get("mois");
            String moisB = (String) b.get("mois");
            int indexA = Arrays.asList(months).indexOf(moisA);
            int indexB = Arrays.asList(months).indexOf(moisB);

            return Integer.compare(indexB, indexA);
        });

        return allData.stream().limit(nbMois).collect(Collectors.toList());
    }

    // 🔴 NOUVELLE MÉTHODE: Répartition par catégorie avec CA
    public List<Map<String, Object>> getRepartitionCategories() {
        List<Map<String, Object>> repartition = new ArrayList<>();

        categorieRepository.findAll().forEach(categorie -> {
            // Produits de cette catégorie
            List<Long> productIds = produitRepository.findByCategorie(categorie).stream()
                    .map(p -> Long.valueOf(p.getId()))
                    .toList();

            // Ventes pour ces produits
            double categoryRevenue = venteRepository.findAll().stream()
                    .filter(v -> v.getProduit() != null &&
                            productIds.contains(v.getProduit().getId()) &&
                            v.getProduit().getPrix() != null)
                    .mapToDouble(v -> v.getQuantite() * v.getProduit().getPrix())
                    .sum();

            long categorySales = venteRepository.findAll().stream()
                    .filter(v -> v.getProduit() != null &&
                            productIds.contains(v.getProduit().getId()))
                    .mapToLong(v -> v.getQuantite())
                    .sum();

            int productCount = productIds.size();

            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("categorie", categorie.getNom());
            categoryData.put("chiffreAffaires", categoryRevenue);
            categoryData.put("ventes", categorySales);
            categoryData.put("nbProduits", productCount);
            categoryData.put("pourcentageProduits",
                    produitRepository.count() > 0 ?
                            (productCount * 100.0 / produitRepository.count()) : 0);

            repartition.add(categoryData);
        });

        // Trier par CA décroissant
        repartition.sort((a, b) ->
                Double.compare((double) b.get("chiffreAffaires"), (double) a.get("chiffreAffaires")));

        return repartition;
    }

    // 🔴 NOUVELLE MÉTHODE: Alertes
    public List<Map<String, Object>> getAlertes() {
        List<Map<String, Object>> alertes = new ArrayList<>();

        // Alertes stock faible (< 5)
        produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null && p.getQuantite() < 5 && p.getQuantite() > 0)
                .forEach(p -> {
                    Map<String, Object> alerte = new HashMap<>();
                    alerte.put("type", "STOCK_FAIBLE");
                    alerte.put("produit", p.getNom());
                    alerte.put("stockActuel", p.getQuantite());
                    alerte.put("seuil", 5);
                    alerte.put("priorite", "MOYENNE");
                    alerte.put("message", "Stock faible pour " + p.getNom() + " (" + p.getQuantite() + " restants)");
                    alertes.add(alerte);
                });

        // Alertes rupture de stock
        produitRepository.findAll().stream()
                .filter(p -> p.getQuantite() != null && p.getQuantite() == 0)
                .forEach(p -> {
                    Map<String, Object> alerte = new HashMap<>();
                    alerte.put("type", "RUPTURE_STOCK");
                    alerte.put("produit", p.getNom());
                    alerte.put("priorite", "HAUTE");
                    alerte.put("message", "Rupture de stock pour " + p.getNom());
                    alertes.add(alerte);
                });

        // Alertes ventes exceptionnelles (produits avec beaucoup de ventes)
        Map<String, Long> ventesParProduit = new HashMap<>();
        venteRepository.findAll().forEach(v -> {
            if (v.getProduit() != null) {
                String nomProduit = v.getProduit().getNom();
                ventesParProduit.put(nomProduit,
                        ventesParProduit.getOrDefault(nomProduit, 0L) + v.getQuantite());
            }
        });

        ventesParProduit.entrySet().stream()
                .filter(entry -> entry.getValue() > 50) // Seuil: 50 ventes
                .forEach(entry -> {
                    Map<String, Object> alerte = new HashMap<>();
                    alerte.put("type", "VENTE_EXCEPTIONNELLE");
                    alerte.put("produit", entry.getKey());
                    alerte.put("ventes", entry.getValue());
                    alerte.put("priorite", "BASSE");
                    alerte.put("message", "Ventes exceptionnelles pour " + entry.getKey() + " (" + entry.getValue() + " unités vendues)");
                    alertes.add(alerte);
                });

        return alertes;
    }

    // 🔴 NOUVELLE MÉTHODE: Statistiques globales
    public Map<String, Object> getGlobalStats() {
        Map<String, Object> globalStats = new HashMap<>();

        // Rassembler toutes les stats
        globalStats.put("statsBasiques", getAllStats());
        globalStats.put("kpis", getKPIs());
        globalStats.put("evolutionCA", getEvolutionCA(6));
        globalStats.put("repartitionCategories", getRepartitionCategories());
        globalStats.put("statsStock", getStatistiquesStock());
        globalStats.put("alertes", getAlertes());
        globalStats.put("tendances", getTendances());
        globalStats.put("performances", getPerformances());
        globalStats.put("topClients", getTopClients(5));
        globalStats.put("topProduits", getTopProduitsVendus(100));

        return globalStats;
    }
}