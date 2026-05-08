package com.impactovisible.service;

import com.impactovisible.domain.Informe;
import com.impactovisible.dto.InformeDTO;
import com.impactovisible.repository.InformeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InformeService {
    private final InformeRepository repository;
    public InformeService(InformeRepository repository) { this.repository = repository; }

    public List<InformeDTO> findAll() {
        return repository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private InformeDTO convertToDTO(Informe i) {
        return InformeDTO.builder()
                .idInforme(i.getIdInforme())
                .periodoInicio(i.getPeriodoInicio())
                .periodoFin(i.getPeriodoFin())
                .codigoPlanta(i.getPlanta().getCodigoPlanta())
                .build();
    }
}