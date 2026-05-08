package com.impactovisible.controller;

import com.impactovisible.dto.ZonaDTO;
import com.impactovisible.service.ZonaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/zonas")
public class ZonaController {
    private final ZonaService zonaService;
    public ZonaController(ZonaService zonaService) { this.zonaService = zonaService; }

    @GetMapping({"", "/"})
    public ResponseEntity<List<ZonaDTO>> getAll() {
        return ResponseEntity.ok(zonaService.findAll());
    }
}