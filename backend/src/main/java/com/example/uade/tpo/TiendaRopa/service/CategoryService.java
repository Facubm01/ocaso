package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.entity.Category;
import java.util.List;

public interface CategoryService {
    List<Category> listar();
    Category obtener(Long id);
    Category crear(String nombre);
    Category actualizar(Long id, String nombre);
    void eliminar(Long id);
}
