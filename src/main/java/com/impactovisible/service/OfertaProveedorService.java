package com.impactovisible.service;

import com.impactovisible.domain.OfertaProveedor;
import com.impactovisible.dto.OfertaProveedorDTO;
import com.impactovisible.repository.OfertaProveedorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OfertaProveedorService {
    private final OfertaProveedorRepository repository;
    public OfertaProveedorService(OfertaProveedorRepository repository) { this.repository = repository; }

    public List<OfertaProveedorDTO> findAll() {
        return repository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private OfertaProveedorDTO convertToDTO(OfertaProveedor o) {
        return OfertaProveedorDTO.builder()
                .idOferta(o.getIdOferta())
                .registroProveedor(o.getProveedor().getRegistroProveedor())
                .productoServicio(o.getProductoServicio())
                .build();
    }
}