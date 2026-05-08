package com.impactovisible.service;

import com.impactovisible.domain.AccionSostenibilidad;
import com.impactovisible.dto.AccionSostenibilidadDTO;
import com.impactovisible.repository.AccionSostenibilidadRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccionSostenibilidadService {
    private final AccionSostenibilidadRepository repository;
    public AccionSostenibilidadService(AccionSostenibilidadRepository repository) { this.repository = repository; }

    public List<AccionSostenibilidadDTO> findAll() {
        return repository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private AccionSostenibilidadDTO convertToDTO(AccionSostenibilidad a) {
        return AccionSostenibilidadDTO.builder()
                .codigoAccion(a.getCodigoAccion())
                .titulo(a.getTitulo())
                .estado(a.getEstado().name())
                .codigoPlanta(a.getPlanta() != null ? a.getPlanta().getCodigoPlanta() : null)
                .build();
    }
}