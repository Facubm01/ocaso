package com.example.uade.tpo.TiendaRopa.controllers.checkout;

import java.math.BigDecimal;
import java.util.List;

import com.example.uade.tpo.TiendaRopa.entity.Talle;

public record CheckoutResponse(
        List<CheckoutLine> items,
        BigDecimal total
) {
        public record CheckoutLine(
            Long productoId,
            String nombre,
            Talle talle,
            int cantidad,
            BigDecimal precioUnitarioOriginal,
            Integer descuentoPctAplicado,
            BigDecimal precioUnitarioFinal,
            BigDecimal subtotal
    ) {}
}
