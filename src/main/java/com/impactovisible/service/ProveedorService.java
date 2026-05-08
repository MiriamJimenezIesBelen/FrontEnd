package com.impactovisible.service;

import com.impactovisible.domain.Proveedor;
import com.impactovisible.dto.ProveedorDTO;
import com.impactovisible.repository.ProveedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorService {
    private final ProveedorRepository repository;
    public ProveedorService(ProveedorRepository repository) { this.repository = repository; }

    public List<ProveedorDTO> findAll() {
        return repository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ProveedorDTO convertToDTO(Proveedor p) {
        return ProveedorDTO.builder()
                .registroProveedor(p.getRegistroProveedor())
                .nombre(p.getNombre())
                .pais(p.getPais())
                .build();
    }
}