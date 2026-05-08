package com.impactovisible.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorDTO {
    private String registroProveedor;
    private String nombre;
    private String pais;
}