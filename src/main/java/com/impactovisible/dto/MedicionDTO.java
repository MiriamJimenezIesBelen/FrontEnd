package com.impactovisible.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MedicionDTO {
    private String codigoMedicion;
    private String tipo;
    private BigDecimal valor;
    private LocalDate fecha;
    private String codigoPlanta;

    // Campos para recibir el formulario del frontend de una vez
    private Long idEmpresa;
    private BigDecimal energia;
    private BigDecimal agua;
    private BigDecimal co2;
    private BigDecimal residuos;
}