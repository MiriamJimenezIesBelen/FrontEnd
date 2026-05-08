package com.impactovisible.repository;

import com.impactovisible.domain.ObjetivoESG;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjetivoESGRepository extends JpaRepository<ObjetivoESG, Long> {

  List<ObjetivoESG> findByIdEmpresa(Long idEmpresa);
}
