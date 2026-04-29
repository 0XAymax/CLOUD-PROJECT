package com.gestionVentesBackend.Repository;

import com.gestionVentesBackend.Model.KpiGlobal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KpiGlobalRepository extends JpaRepository<KpiGlobal, Long> {
    List<KpiGlobal> findByAnneeOrderByMoisAsc(Integer annee);
    List<KpiGlobal> findByAnneeAndMois(Integer annee, Integer mois);
}
