package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ZonaDTO {
    private String codigoZona;
    private String nombre;
    private String codigoPlanta;
}