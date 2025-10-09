package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.controllers.talleStock.TalleStockDTO;
import com.example.uade.tpo.TiendaRopa.entity.Producto;
import java.util.List;

public interface ProductoService {
    List<Producto> listarDisponibles();
    List<Producto> listarDisponiblesPorCategoria(Long categoriaId);
    Producto obtener(Long id);

    Producto crear(String nombre, double precio, Long categoriaId,
                   String descripcion, Long imageId, List<Long>imageIds , List<TalleStockDTO> talles, Integer descuentoPct);

    Producto actualizar(Long id, String nombre, double precio, Long categoriaId,
                        String descripcion, Long imageId, List<Long>imageIds , List<TalleStockDTO> talles, Integer descuentoPct);


    void eliminar(Long id);
}
