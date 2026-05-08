package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlantaDTO {
    private String codigoPlanta;
    private String nombre;
    private String direccion;
    private Long idEmpresa;
}