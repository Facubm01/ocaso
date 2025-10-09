package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.controllers.talleStock.TalleStockDTO;
import com.example.uade.tpo.TiendaRopa.entity.Category;
import com.example.uade.tpo.TiendaRopa.entity.Producto;
import com.example.uade.tpo.TiendaRopa.entity.ProductoTalle;
import com.example.uade.tpo.TiendaRopa.repository.CategoryRepository;
import com.example.uade.tpo.TiendaRopa.repository.ProductoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepo;
    @Autowired
    private CategoryRepository categoryRepo;

    // listar
    @Override @Transactional(readOnly = true)
    public List<Producto> listarDisponibles() {
        return productoRepo.findAllConAlgunaVarianteDisponible();
    }

    // listar por categoría
    @Override @Transactional(readOnly = true)
    public List<Producto> listarDisponiblesPorCategoria(Long categoriaId) {
        if (!categoryRepo.existsById(categoriaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "La categoría no existe");
        }
        return productoRepo.findByCategoriaConAlgunaVarianteDisponible(categoriaId);
    }

    // obtener
    @Override @Transactional(readOnly = true)
    public Producto obtener(Long id) {
        return productoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
    }

    // crear
    @Override
    public Producto crear(String nombre, double precio, Long categoriaId,
                          String descripcion, Long imageId, List<Long>imageIds, List<TalleStockDTO> tallesDto, Integer descuentoPct) {
        if (productoRepo.existsByNombreIgnoreCase(nombre)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un producto con ese nombre");
        }
        Category cat = categoryRepo.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));

        Producto p = new Producto();
        p.setNombre(nombre);
        p.setPrecio(precio);
        p.setCategoria(cat);
        p.setDescripcion(descripcion);
        p.setImageId(imageId); // ← ahora es Long
        p.setImageIds(imageIds);
        int d = Objects.requireNonNullElse(descuentoPct, 0);
        d = Math.max(0, Math.min(90, d));
        p.setDescuentoPct(d);

        p.getTalles().clear();
        for (var t : tallesDto) {
            var pt = new ProductoTalle();
            pt.setTalle(t.talle);
            pt.setStock(t.stock);
            pt.setProducto(p);
            p.getTalles().add(pt);
        }
        return productoRepo.save(p);
    }

    // actualizar
    @Override
    public Producto actualizar(Long id, String nombre, double precio, Long categoriaId,
                               String descripcion, Long imageId, List<Long> imageIds, List<TalleStockDTO> tallesDto, Integer descuentoPct) {
        Producto existente = productoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        Category cat = categoryRepo.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));

        if (productoRepo.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un producto con ese nombre");
        }

        existente.setNombre(nombre);
        existente.setPrecio(precio);
        existente.setCategoria(cat);
        existente.setDescripcion(descripcion);
        existente.setImageId(imageId); // ← ahora es Long
        existente.setImageIds(imageIds);
        int d = Objects.requireNonNullElse(descuentoPct, 0);
        d = Math.max(0, Math.min(90, d));
        existente.setDescuentoPct(d);

        existente.getTalles().clear();
        for (var t : tallesDto) {
            var pt = new ProductoTalle();
            pt.setTalle(t.talle);
            pt.setStock(t.stock);
            pt.setProducto(existente);
            existente.getTalles().add(pt);
        }

        return productoRepo.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        Producto existente = productoRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        productoRepo.delete(existente);
    }
}
