package com.impactovisible;

import com.impactovisible.controller.EmpresaController;
import com.impactovisible.dto.EmpresaDTO;
import com.impactovisible.dto.LoginResponse;
import com.impactovisible.service.EmpresaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmpresaControllerTest {

    @Mock
    private EmpresaService empresaService;

    @InjectMocks
    private EmpresaController empresaController;

    @Test
    void getAll_debeRetornarListaEmpresas() {
        EmpresaDTO dto = EmpresaDTO.builder().nombre("Tesla").build();
        when(empresaService.findAll()).thenReturn(List.of(dto));

        ResponseEntity<List<EmpresaDTO>> response = empresaController.getAll();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void create_debeCrearEmpresa() {
        EmpresaDTO dto = EmpresaDTO.builder().nombre("Tesla").build();
        when(empresaService.save(any(EmpresaDTO.class))).thenReturn(dto);

        ResponseEntity<EmpresaDTO> response = empresaController.create(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Tesla", response.getBody().getNombre());
    }

    @Test
    void login_conCredencialesCorrectas_debeRetornar200() {
        LoginResponse loginResponse = LoginResponse.builder()
                .token("fake.jwt.token")
                .nombre("Tesla")
                .rol("USER")
                .build();
        when(empresaService.login(anyString(), anyString())).thenReturn(loginResponse);

        Map<String, String> datos = Map.of("correo", "user@test.com", "password", "1234");
        ResponseEntity<LoginResponse> response = empresaController.login(datos);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getToken());
    }

    @Test
    void delete_debeEliminarEmpresa() {
        doNothing().when(empresaService).delete(1L);

        ResponseEntity<Void> response = empresaController.delete(1L);

        assertEquals(204, response.getStatusCode().value());
        verify(empresaService, times(1)).delete(1L);
    }
}