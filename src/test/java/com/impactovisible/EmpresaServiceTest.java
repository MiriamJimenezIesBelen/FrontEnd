package com.impactovisible;

import com.impactovisible.domain.Empresa;
import com.impactovisible.dto.EmpresaDTO;
import com.impactovisible.dto.LoginResponse;
import com.impactovisible.repository.EmpresaRepository;
import com.impactovisible.security.JwtService;
import com.impactovisible.service.EmpresaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmpresaServiceTest {

    @Mock
    private EmpresaRepository empresaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private EmpresaService empresaService;

    private Empresa empresa;
    private EmpresaDTO empresaDTO;

    @BeforeEach
    void setUp() {
        empresa = Empresa.builder()
                .idEmpresa(1L)
                .nombre("Tesla Motors")
                .sector("Automotriz")
                .pais("EEUU")
                .ciudad("Austin")
                .tamano(Empresa.Tamano.mediana)
                .correoContacto("user@test.com")
                .password("hashedPassword")
                .rol(Empresa.Rol.USER)
                .build();

        empresaDTO = EmpresaDTO.builder()
                .nombre("Tesla Motors")
                .sector("Automotriz")
                .pais("EEUU")
                .ciudad("Austin")
                .tamano("mediana")
                .correoContacto("user@test.com")
                .password("1234")
                .build();
    }

    @Test
    void findAll_debeRetornarListaDeEmpresas() {
        when(empresaRepository.findAll()).thenReturn(List.of(empresa));

        List<EmpresaDTO> resultado = empresaService.findAll();

        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Tesla Motors", resultado.get(0).getNombre());
        verify(empresaRepository, times(1)).findAll();
    }

    @Test
    void save_debeGuardarEmpresaCorrectamente() {
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresa);

        EmpresaDTO resultado = empresaService.save(empresaDTO);

        assertNotNull(resultado);
        assertEquals("Tesla Motors", resultado.getNombre());
        verify(empresaRepository, times(1)).save(any(Empresa.class));
    }

    @Test
    void login_conCredencialesCorrectas_debeRetornarToken() {
        when(empresaRepository.findByCorreoContacto("user@test.com"))
                .thenReturn(Optional.of(empresa));
        when(passwordEncoder.matches("1234", "hashedPassword"))
                .thenReturn(true);
        when(jwtService.generateToken(anyString(), anyString(), anyLong()))
                .thenReturn("token.fake.jwt");

        LoginResponse resultado = empresaService.login("user@test.com", "1234");

        assertNotNull(resultado);
        assertEquals("Tesla Motors", resultado.getNombre());
        assertNotNull(resultado.getToken());
    }

    @Test
    void login_conPasswordIncorrecta_debeLanzarExcepcion() {
        when(empresaRepository.findByCorreoContacto("user@test.com"))
                .thenReturn(Optional.of(empresa));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword"))
                .thenReturn(false);

        assertThrows(RuntimeException.class, () ->
                empresaService.login("user@test.com", "wrongPassword")
        );
    }

    @Test
    void login_conCorreoInexistente_debeLanzarExcepcion() {
        when(empresaRepository.findByCorreoContacto("noexiste@test.com"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                empresaService.login("noexiste@test.com", "1234")
        );
    }

    @Test
    void delete_debeEliminarEmpresaPorId() {
        doNothing().when(empresaRepository).deleteById(1L);

        empresaService.delete(1L);

        verify(empresaRepository, times(1)).deleteById(1L);
    }

    @Test
    void update_debeActualizarEmpresaCorrectamente() {
        when(empresaRepository.findById(1L)).thenReturn(Optional.of(empresa));
        when(empresaRepository.save(any(Empresa.class))).thenReturn(empresa);

        EmpresaDTO dtoActualizado = EmpresaDTO.builder()
                .nombre("Tesla Updated")
                .sector("Tech")
                .pais("EEUU")
                .ciudad("Austin")
                .tamano("grande")
                .correoContacto("updated@test.com")
                .build();

        EmpresaDTO resultado = empresaService.update(1L, dtoActualizado);

        assertNotNull(resultado);
        verify(empresaRepository, times(1)).save(any(Empresa.class));
    }
}