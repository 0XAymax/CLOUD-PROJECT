package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

/**
 * Entité représentant un Employé.
 * Hérite de Personne et inclut une relation Many-to-One vers l'entité Role.
 */
@Entity
@Table(name = "Employe")
@PrimaryKeyJoinColumn(name = "id_employe") // Lie la clé primaire de cette table à la colonne 'id' de Personne
@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Employe extends Personne {

    // L'employé a un rôle, lié à la table Role
    @ManyToOne(fetch = FetchType.EAGER) // Charge le rôle avec l'employé
    @JoinColumn(name = "id_role", nullable = false) // Correspond à la colonne id_role dans votre DDL
    private Role role;

    @Column(name = "salaire", nullable = false, columnDefinition = "DECIMAL(10,2) DEFAULT 0")
    private Double salaire = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "etat", nullable = false, length = 20)
    private EtatEmploye etat = EtatEmploye.ACTIF;

    // Relation récursive : un employé admin gère d'autres employés
    @ManyToOne
    @JoinColumn(name = "id_admin")
    @JsonIgnore
    private Employe admin;

    @OneToMany(mappedBy = "admin")
    @JsonIgnore
    private List<Employe> employesGeres;

    @OneToMany(mappedBy = "employe")
    @JsonIgnore
    private List<Gestion> gestions;
}