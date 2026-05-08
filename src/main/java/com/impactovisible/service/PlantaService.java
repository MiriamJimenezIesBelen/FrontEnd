package com.impactovisible.service;

import com.impactovisible.domain.Planta;
import com.impactovisible.dto.PlantaDTO;
import com.impactovisible.repository.PlantaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlantaService {
    private final PlantaRepository plantaRepository;

    public PlantaService(PlantaRepository plantaRepository) {
        this.plantaRepository = plantaRepository;
    }

    public List<PlantaDTO> findAll() {
        return plantaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PlantaDTO convertToDTO(Planta planta) {
        return PlantaDTO.builder()
                .codigoPlanta(planta.getCodigoPlanta())
                .nombre(planta.getNombre())
                .direccion(planta.getDireccion())
                .idEmpresa(planta.getEmpresa() != null ? planta.getEmpresa().getIdEmpresa() : null)
                .build();
    }
}