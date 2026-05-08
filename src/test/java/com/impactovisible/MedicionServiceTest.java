package com.impactovisible;

import com.impactovisible.domain.*;
import com.impactovisible.dto.MedicionDTO;
import com.impactovisible.repository.*;
import com.impactovisible.service.MedicionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MedicionServiceTest {

    @Mock
    private MedicionRepository medicionRepository;

    @Mock
    private PlantaRepository plantaRepository;

    @Mock
    private EmpresaRepository empresaRepository;

    @InjectMocks
    private MedicionService medicionService;

    private Empresa empresa;
    private Planta planta;
    private Medicion medicion;

    @BeforeEach
    void setUp() {
        empresa = Empresa.builder()
                .idEmpresa(1L)
                .nombre("Tesla Motors")
                .rol(Empresa.Rol.USER)
                .build();

        planta = Planta.builder()
                .codigoPlanta("P-1")
                .nombre("Planta principal")
                .empresa(empresa)
                .build();

        medicion = Medicion.builder()
                .codigoMedicion("MED-001")
                .planta(planta)
                .fecha(LocalDate.now())
                .tipo(Medicion.TipoMedicion.electricidad)
                .valor(new BigDecimal("1500.00"))
                .build();
    }

    @Test
    void findAll_debeRetornarListaDeMediciones() {
        when(medicionRepository.findAll()).thenReturn(List.of(medicion));

        List<MedicionDTO> resultado = medicionService.findAll();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(medicionRepository, times(1)).findAll();
    }

    @Test
    void guardarDesdeFormulario_debeGuardarCuatroMediciones() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresa));
        when(plantaRepository.findByEmpresa_IdEmpresa(1L)).thenReturn(List.of(planta));
        when(medicionRepository.save(any(Medicion.class))).thenReturn(medicion);

        MedicionDTO dto = MedicionDTO.builder()
                .idEmpresa(1L)
                .energia(new BigDecimal("1500"))
                .agua(new BigDecimal("3000"))
                .co2(new BigDecimal("400"))
                .residuos(new BigDecimal("200"))
                .build();

        medicionService.guardarDesdeFormulario(dto);

        // Debe guardar 4 mediciones: electricidad, agua, emision, residuo
        verify(medicionRepository, times(4)).save(any(Medicion.class));
    }

    @Test
    void guardarDesdeFormulario_conEmpresaInexistente_debeLanzarExcepcion() {
        when(empresaRepository.findById(99L)).thenReturn(Optional.empty());

        MedicionDTO dto = MedicionDTO.builder()
                .idEmpresa(99L)
                .energia(new BigDecimal("1500"))
                .build();

        assertThrows(RuntimeException.class, () ->
                medicionService.guardarDesdeFormulario(dto)
        );
    }

    @Test
    void findByEmpresa_debeRetornarMedicionesAgrupadas() {
        when(medicionRepository.findByPlanta_Empresa_IdEmpresa(1L))
                .thenReturn(List.of(medicion));

        List<MedicionDTO> resultado = medicionService.findByEmpresa(1L);

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(medicionRepository, times(1)).findByPlanta_Empresa_IdEmpresa(1L);
    }
}