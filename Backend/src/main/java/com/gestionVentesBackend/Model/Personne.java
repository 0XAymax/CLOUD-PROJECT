package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Définition de la stratégie d'héritage
@Entity
@Table(name = "Personne")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@AllArgsConstructor
@NoArgsConstructor  
public abstract class Personne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "numero_tel", length = 20)
    private String numeroTel;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "address", length = 200)
    private String address;

    @Column(name = "photo_url", length = 255)
    private String photoUrl;

    // Pour l'authentification, nous allons stocker le mot de passe dans Personne
    // Dans une application réelle, ceci devrait être haché (ex: avec BCrypt)
    @Column(name = "password", nullable = false, length = 255)
    private String password;

   
}
