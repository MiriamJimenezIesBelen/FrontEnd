package com.impactovisible.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AsignacionDTO {
    private String codigoAsignacion;
    private String codigoMaquina;
    private String codigoZona;
}