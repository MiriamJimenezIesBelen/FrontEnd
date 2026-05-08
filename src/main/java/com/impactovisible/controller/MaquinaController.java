package com.impactovisible.controller;

import com.impactovisible.dto.MaquinaDTO;
import com.impactovisible.service.MaquinaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maquinas")
public class MaquinaController {
    private final MaquinaService maquinaService;
    public MaquinaController(MaquinaService maquinaService) { this.maquinaService = maquinaService; }

    @GetMapping("/")
    public ResponseEntity<List<MaquinaDTO>> getAll() { return ResponseEntity.ok(maquinaService.findAll()); }
}