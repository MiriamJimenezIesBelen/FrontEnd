package com.impactovisible.service;

import com.impactovisible.domain.Zona;
import com.impactovisible.dto.ZonaDTO;
import com.impactovisible.repository.ZonaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ZonaService {
    private final ZonaRepository zonaRepository;
    public ZonaService(ZonaRepository zonaRepository) { this.zonaRepository = zonaRepository; }

    public List<ZonaDTO> findAll() {
        return zonaRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ZonaDTO convertToDTO(Zona zona) {
        return ZonaDTO.builder()
                .codigoZona(zona.getCodigoZona())
                .nombre(zona.getNombre())
                .codigoPlanta(zona.getPlanta() != null ? zona.getPlanta().getCodigoPlanta() : null)
                .build();
    }
}