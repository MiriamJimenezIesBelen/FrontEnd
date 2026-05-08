package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MaquinaDTO {
    private String codigoMaquina;
    private String nombre;
    private String tipo;
    private String codigoPlanta;
}