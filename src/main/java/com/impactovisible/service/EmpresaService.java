package com.impactovisible.service;

import com.impactovisible.domain.Empresa;
import com.impactovisible.dto.EmpresaDTO;
import com.impactovisible.dto.LoginResponse;
import com.impactovisible.repository.EmpresaRepository;
import com.impactovisible.security.JwtService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaService {
    private final EmpresaRepository empresaRepository;


    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;


    public EmpresaService(EmpresaRepository empresaRepository,
                          @Lazy PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.empresaRepository = empresaRepository;
        this.passwordEncoder   = passwordEncoder;
        this.jwtService        = jwtService;
    }

    public EmpresaDTO save(EmpresaDTO dto) {
        Empresa empresa = Empresa.builder()
                .idEmpresa(dto.getIdEmpresa())
                .numeroRegistro(dto.getNumeroRegistro())
                .nombre(dto.getNombre())
                .password(passwordEncoder.encode(dto.getPassword()))
                .sector(dto.getSector())
                .pais(dto.getPais())
                .ciudad(dto.getCiudad())
                .tamano(Empresa.Tamano.valueOf(dto.getTamano().toLowerCase()))
                .correoContacto(dto.getCorreoContacto())
                .rol(Empresa.Rol.USER)
                .build();

        Empresa empresaGuardada = empresaRepository.save(empresa);
        return convertToDTO(empresaGuardada);
    }

    public List<EmpresaDTO> findAll() {
        return empresaRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EmpresaDTO convertToDTO(Empresa empresa) {
        return EmpresaDTO.builder()
                .idEmpresa(empresa.getIdEmpresa())
                .nombre(empresa.getNombre())
                .sector(empresa.getSector())
                .pais(empresa.getPais())
                // Usamos un operador ternario para evitar el NullPointerException
                .rol(empresa.getRol() != null ? empresa.getRol().name() : "USER")
                .build();
    }


    public LoginResponse login(String correo, String password) {
        Empresa empresa = empresaRepository.findByCorreoContacto(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, empresa.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        String token = jwtService.generateToken(
                empresa.getCorreoContacto(),
                empresa.getRol().name(),
                empresa.getIdEmpresa()
        );

        return LoginResponse.builder()
                .token(token)
                .idEmpresa(empresa.getIdEmpresa())
                .nombre(empresa.getNombre())
                .sector(empresa.getSector())
                .rol(empresa.getRol().name())
                .build();
    }

    public EmpresaDTO update(Long id, EmpresaDTO dto) {
        Empresa empresa = empresaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));

        empresa.setNombre(dto.getNombre());
        empresa.setSector(dto.getSector());
        empresa.setPais(dto.getPais());
        empresa.setCiudad(dto.getCiudad());
        if (dto.getTamano() != null) {
            empresa.setTamano(Empresa.Tamano.valueOf(dto.getTamano().toLowerCase()));
        }
        empresa.setCorreoContacto(dto.getCorreoContacto());

        return convertToDTO(empresaRepository.save(empresa));
    }

    public void delete(Long id) {
        empresaRepository.deleteById(id);
    }
}