package com.impactovisible.repository;

import com.impactovisible.domain.Medicion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicionRepository extends JpaRepository<Medicion, String> {
    List<Medicion> findByPlanta_Empresa_IdEmpresa(Long idEmpresa);
}