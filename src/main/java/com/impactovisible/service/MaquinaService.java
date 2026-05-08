package com.impactovisible.service;

import com.impactovisible.domain.Maquina;
import com.impactovisible.dto.MaquinaDTO;
import com.impactovisible.repository.MaquinaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaquinaService {
    private final MaquinaRepository maquinaRepository;
    public MaquinaService(MaquinaRepository maquinaRepository) { this.maquinaRepository = maquinaRepository; }

    public List<MaquinaDTO> findAll() {
        return maquinaRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private MaquinaDTO convertToDTO(Maquina m) {
        return MaquinaDTO.builder()
                .codigoMaquina(m.getCodigoMaquina())
                .nombre(m.getNombre())
                .tipo(m.getTipo())
                .build();
    }
}