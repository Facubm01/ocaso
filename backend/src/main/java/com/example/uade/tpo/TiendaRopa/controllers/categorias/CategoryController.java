package com.example.uade.tpo.TiendaRopa.controllers.categorias;


import com.example.uade.tpo.TiendaRopa.entity.Category;
import com.example.uade.tpo.TiendaRopa.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@Validated
public class CategoryController {

    @Autowired
    private CategoryService service;

    @GetMapping
    public List<CategoryResponse> listar() {
        return service.listar().stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CategoryResponse obtener(@PathVariable Long id) {
        return CategoryResponse.from(service.obtener(id));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> crear(@Valid @RequestBody CategoryRequest req) {
        Category creada = service.crear(req.nombre());
        return ResponseEntity
                .created(URI.create("/api/categorias/" + creada.getId()))
                .body(CategoryResponse.from(creada));
    }

    @PutMapping("/{id}")
    public CategoryResponse actualizar(@PathVariable Long id,
                                       @Valid @RequestBody CategoryRequest req) {
        Category actualizada = service.actualizar(id, req.nombre());
        return CategoryResponse.from(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
