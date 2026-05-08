package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AccionSostenibilidadDTO {
    private String codigoAccion;
    private String titulo;
    private String estado;
    private String codigoPlanta;
}