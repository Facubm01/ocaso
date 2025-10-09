package com.example.uade.tpo.TiendaRopa.controllers.categorias;
import jakarta.validation.constraints.NotBlank;

public record CategoryRequest(
            @NotBlank(message = "El nombre es obligatorio")
            String nombre
    ) {}