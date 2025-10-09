package com.example.uade.tpo.TiendaRopa.controllers.productos;

import com.example.uade.tpo.TiendaRopa.entity.Producto;
import com.example.uade.tpo.TiendaRopa.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@Validated
public class ProductoController {

    @Autowired
    private ProductoService service;

    /**
     * Listado de productos disponibles.
     * Soporta:
     * - Filtrar por categoría (categoriaId)
     * - Filtrar por precio final (minFinal / maxFinal)
     * - Ordenar por precio final (orden=precio_final_asc | precio_final_desc)
     */
    @GetMapping
    public List<ProductoResponse> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Double minFinal,
            @RequestParam(required = false) Double maxFinal,
            @RequestParam(required = false, name = "orden") String orden
    ) {
        List<Producto> base = (categoriaId == null)
                ? service.listarDisponibles()
                : service.listarDisponiblesPorCategoria(categoriaId);

        // Mapear a DTO (calcula precioFinal dentro de ProductoResponse.from)
        List<ProductoResponse> resp = base.stream()
                .map(ProductoResponse::from)
                .toList();

        // Filtro por precioFinal si corresponde
        if (minFinal != null) {
            resp = resp.stream().filter(p -> p.getPrecioFinal() >= minFinal).toList();
        }
        if (maxFinal != null) {
            resp = resp.stream().filter(p -> p.getPrecioFinal() <= maxFinal).toList();
        }

        // Orden por precioFinal si corresponde
        if ("precio_final_asc".equalsIgnoreCase(orden)) {
            resp = resp.stream()
                    .sorted(Comparator.comparingDouble(ProductoResponse::getPrecioFinal))
                    .toList();
        } else if ("precio_final_desc".equalsIgnoreCase(orden)) {
            resp = resp.stream()
                    .sorted(Comparator.comparingDouble(ProductoResponse::getPrecioFinal).reversed())
                    .toList();
        }

        return resp;
    }

    @GetMapping("/{id}")
    public ProductoResponse obtener(@PathVariable Long id) {
        return ProductoResponse.from(service.obtener(id));
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoCreateRequest req) {
        var creado = service.crear(
                req.getNombre(),
                req.getPrecio(),
                req.getCategoriaId(),
                req.getDescripcion(),
                req.getImageId(),
                req.getImageIds(),
                req.getTalles(),
                req.getDescuentoPct()   // <-- NUEVO: descuento por producto
        );
        return ResponseEntity
                .created(URI.create("/api/productos/" + creado.getId()))
                .body(ProductoResponse.from(creado));
    }

    @PutMapping("/{id}")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoUpdateRequest req) {
        var actualizado = service.actualizar(
                id,
                req.getNombre(),
                req.getPrecio(),
                req.getCategoriaId(),
                req.getDescripcion(),
                req.getImageId(),
                req.getImageIds(),
                req.getTalles(),
                req.getDescuentoPct()   // <-- NUEVO: descuento por producto
        );
        return ProductoResponse.from(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
