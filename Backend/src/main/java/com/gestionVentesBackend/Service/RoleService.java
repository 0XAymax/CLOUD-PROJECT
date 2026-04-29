package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.Model.Role;
import com.gestionVentesBackend.Repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service pour gérer la logique métier des Rôles
 */
@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Optional<Role> getRoleById(Integer id) {
        return roleRepository.findById(id);
    }

    public Optional<Role> getRoleByNom(String nom) {
        return roleRepository.findByNameRole(nom);
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Integer id, Role roleDetails) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rôle non trouvé"));
        
        if (roleDetails.getNameRole() != null) {
            role.setNameRole(roleDetails.getNameRole());
        }
        
        if (roleDetails.getDescription() != null) {
            role.setDescription(roleDetails.getDescription());
        }
        
        return roleRepository.save(role);
    }

    public void deleteRole(Integer id) {
        roleRepository.deleteById(id);
    }

    // Créer ou récupérer un rôle par nom
    public Role getOrCreateRole(String nomRole) {
        return roleRepository.findByNameRole(nomRole)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setNameRole(nomRole);
                    return roleRepository.save(newRole);
                });
    }
}
