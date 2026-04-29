package com.gestionVentesBackend.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entité représentant le Rôle d'un Employé.
 * Mappe à la table 'Role' de la base de données.
 */
@Entity
@Table(name = "Role")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer idRole;

    @Column(name = "name_role", nullable = false, length = 100)
    private String nameRole;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;


}
