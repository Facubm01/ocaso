package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.entity.Category;
import com.example.uade.tpo.TiendaRopa.repository.CategoryRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository repo;

    @Override @Transactional(readOnly = true)
    public List<Category> listar() {
        return repo.findAll();
    }

    @Override @Transactional(readOnly = true)
    public Category obtener(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe la categoría con id=" + id));
    }

    @Override
    public Category crear(String nombre) {
        if (repo.existsByNombreIgnoreCase(nombre)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Ya existe una categoría con nombre='" + nombre + "'");
        }
        return repo.save(new Category(nombre));
    }

    @Override
    public Category actualizar(Long id, String nombre) {
        Category existente = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe la categoría con id=" + id));

        if (repo.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Ya existe una categoría con nombre='" + nombre + "'");
        }

        existente.setNombre(nombre);
        return repo.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        Category existente = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No existe la categoría con id=" + id));
        repo.delete(existente);
    }

}
