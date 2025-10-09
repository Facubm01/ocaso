package com.example.uade.tpo.TiendaRopa.controllers.categorias;

import com.example.uade.tpo.TiendaRopa.entity.Category;

public record CategoryResponse(Long id, String nombre) {
        public static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getNombre());
        }
    }
