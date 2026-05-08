package com.impactovisible.repository;

import com.impactovisible.domain.Planta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantaRepository extends JpaRepository<Planta, String> {
    List<Planta> findByEmpresa_IdEmpresa(Long idEmpresa);
}