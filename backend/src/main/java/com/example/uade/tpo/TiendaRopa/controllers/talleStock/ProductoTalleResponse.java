package com.example.uade.tpo.TiendaRopa.controllers.talleStock;

import com.example.uade.tpo.TiendaRopa.entity.ProductoTalle;
import com.example.uade.tpo.TiendaRopa.entity.Talle;

public record ProductoTalleResponse(Talle talle, int stock) {
    public static ProductoTalleResponse from(ProductoTalle pt) {
        return new ProductoTalleResponse(pt.getTalle(), pt.getStock());
    }
}