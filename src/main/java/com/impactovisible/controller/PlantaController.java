package com.impactovisible.controller;

import com.impactovisible.dto.PlantaDTO;
import com.impactovisible.service.PlantaService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/plantas")
public class PlantaController {
    private final PlantaService plantaService;

    public PlantaController(PlantaService plantaService) {
        this.plantaService = plantaService;
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<PlantaDTO>> getAll() {
        return ResponseEntity.ok(plantaService.findAll());
    }
}