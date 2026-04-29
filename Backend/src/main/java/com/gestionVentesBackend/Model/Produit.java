package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "produit")
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_produit")
    private Integer id;

    @Column(name = "name", nullable = false)
    private String nom;

    @Column(name = "prix", nullable = false)
    private Double prix;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url")
    private String image;

    @Column(name = "quantite")
    private Integer quantite;

    @Column(name = "product_rank")
    private Integer rank;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "reviews_count")
    private Integer reviews_count;

    // 🔗 Relation ManyToOne avec Categorie (correspond à mappedBy dans Categorie)
    @ManyToOne
    @JoinColumn(name = "id_categorie")
    private Categorie categorie;

    @OneToMany(mappedBy = "produit")
    @JsonIgnore
    private List<Vente> ventes;

    @OneToMany(mappedBy = "produit")
    @JsonIgnore
    private List<Gestion> gestions;

    @OneToMany(mappedBy = "produit")
    @JsonIgnore
    private List<Investissement> investissements;


}