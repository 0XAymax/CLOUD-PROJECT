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
 * Entité représentant un Client.
 * Hérite de Personne. Utilise la stratégie d'héritage JOINED.
 */
@Entity
@Table(name = "Client")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@PrimaryKeyJoinColumn(name = "id_client") // Lie la clé primaire de cette table à la colonne 'id' de Personne
public class Client extends Personne {

    // Aucun champ spécifique pour un client n'est nécessaire selon le modèle d'inscription simple.
    // L'existence de cette classe permet à JPA de créer la table 'Client'
    // et de distinguer un Client d'un Investisseur ou d'une Personne générique.

    // Si vous aviez des champs spécifiques aux clients (ex: pointsFidelite),
    // ils seraient ajoutés ici.

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Vente> ventes;
}