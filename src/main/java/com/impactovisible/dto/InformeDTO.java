package com.impactovisible.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class InformeDTO {
    private Long idInforme;
    private String codigoPlanta;
    private LocalDate periodoInicio;
    private LocalDate periodoFin;
}