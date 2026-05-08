package com.impactovisible.repository;

import com.impactovisible.domain.AccionSostenibilidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccionSostenibilidadRepository extends JpaRepository<AccionSostenibilidad, String> {}