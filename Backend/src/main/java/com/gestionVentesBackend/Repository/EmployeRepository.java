package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.Employe;
import com.gestionVentesBackend.Model.EtatEmploye;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository pour gérer les opérations CRUD sur Employe
 */
@Repository
public interface EmployeRepository extends JpaRepository<Employe, Long> {
    Optional<Employe> findByEmail(String email);
    List<Employe> findByAdminId(Long adminId);
    List<Employe> findByEtat(EtatEmploye etat);
}
