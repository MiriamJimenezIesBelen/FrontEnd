package com.impactovisible.service;

import com.impactovisible.domain.*;
import com.impactovisible.dto.MedicionDTO;
import com.impactovisible.repository.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MedicionService {

    private final MedicionRepository medicionRepository;
    private final PlantaRepository   plantaRepository;
    private final EmpresaRepository  empresaRepository;

    public MedicionService(MedicionRepository medicionRepository,
                           PlantaRepository plantaRepository,
                           EmpresaRepository empresaRepository) {
        this.medicionRepository = medicionRepository;
        this.plantaRepository   = plantaRepository;
        this.empresaRepository  = empresaRepository;
    }

    // Guarda los 4 valores del formulario como mediciones separadas
    public void guardarDesdeFormulario(MedicionDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.getIdEmpresa())
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        // Busca planta existente o crea una por defecto
        Planta planta = plantaRepository
                .findByEmpresa_IdEmpresa(dto.getIdEmpresa())
                .stream().findFirst()
                .orElseGet(() -> plantaRepository.save(
                        Planta.builder()
                                .codigoPlanta("P-" + dto.getIdEmpresa())
                                .nombre("Planta principal")
                                .direccion("-")
                                .empresa(empresa)
                                .build()
                ));

        LocalDate fecha = LocalDate.now();
        String base = UUID.randomUUID().toString().substring(0, 8);

        if (dto.getEnergia()  != null) guardar(planta, fecha, Medicion.TipoMedicion.electricidad, dto.getEnergia(),  base + "-E");
        if (dto.getAgua()     != null) guardar(planta, fecha, Medicion.TipoMedicion.agua,          dto.getAgua(),     base + "-A");
        if (dto.getCo2()      != null) guardar(planta, fecha, Medicion.TipoMedicion.emision,        dto.getCo2(),      base + "-C");
        if (dto.getResiduos() != null) guardar(planta, fecha, Medicion.TipoMedicion.residuo,        dto.getResiduos(), base + "-R");
    }

    private void guardar(Planta planta, LocalDate fecha,
                         Medicion.TipoMedicion tipo, BigDecimal valor, String codigo) {
        medicionRepository.save(Medicion.builder()
                .codigoMedicion(codigo)
                .planta(planta)
                .fecha(fecha)
                .tipo(tipo)
                .valor(valor)
                .build());
    }

    // Devuelve registros agrupados por fecha para el frontend
    public List<MedicionDTO> findByEmpresa(Long idEmpresa) {
        List<Medicion> todas = medicionRepository.findByPlanta_Empresa_IdEmpresa(idEmpresa);

        return todas.stream()
                .collect(Collectors.groupingBy(Medicion::getFecha))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    List<Medicion> grupo = entry.getValue();
                    return MedicionDTO.builder()
                            .fecha(entry.getKey())
                            .energia( getValor(grupo, Medicion.TipoMedicion.electricidad))
                            .agua(    getValor(grupo, Medicion.TipoMedicion.agua))
                            .co2(     getValor(grupo, Medicion.TipoMedicion.emision))
                            .residuos(getValor(grupo, Medicion.TipoMedicion.residuo))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private BigDecimal getValor(List<Medicion> grupo, Medicion.TipoMedicion tipo) {
        return grupo.stream()
                .filter(m -> m.getTipo() == tipo)
                .map(Medicion::getValor)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }

    public List<MedicionDTO> findAll() {
        return medicionRepository.findAll().stream()
                .map(m -> MedicionDTO.builder()
                        .codigoMedicion(m.getCodigoMedicion())
                        .tipo(m.getTipo().name())
                        .valor(m.getValor())
                        .fecha(m.getFecha())
                        .build())
                .collect(Collectors.toList());
    }
}