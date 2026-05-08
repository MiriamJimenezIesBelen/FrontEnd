package com.impactovisible.repository;

import com.impactovisible.domain.OfertaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfertaProveedorRepository extends JpaRepository<OfertaProveedor, String> {}