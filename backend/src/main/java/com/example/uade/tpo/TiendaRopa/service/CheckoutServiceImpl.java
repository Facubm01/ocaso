package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.controllers.checkout.CheckoutItem;
import com.example.uade.tpo.TiendaRopa.controllers.checkout.CheckoutRequest;
import com.example.uade.tpo.TiendaRopa.controllers.checkout.CheckoutResponse;
import com.example.uade.tpo.TiendaRopa.entity.Producto;
import com.example.uade.tpo.TiendaRopa.entity.ProductoTalle;
import com.example.uade.tpo.TiendaRopa.repository.ProductoRepository;
import com.example.uade.tpo.TiendaRopa.repository.ProductoTalleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private final ProductoRepository productoRepository;
    private final ProductoTalleRepository productoTalleRepository;

    public CheckoutServiceImpl(ProductoRepository productoRepository,
                               ProductoTalleRepository productoTalleRepository) {
        this.productoRepository = productoRepository;
        this.productoTalleRepository = productoTalleRepository;
    }

    @Override
    @Transactional
    public CheckoutResponse checkout(CheckoutRequest req) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito está vacío");
        }

        // 1) Cachear productos por id
        Map<Long, Producto> productos = new HashMap<>();
        for (CheckoutItem it : req.items()) {
            productos.computeIfAbsent(it.productoId(), id ->
                productoRepository.findById(id).orElseThrow(() ->
                    new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado (id=" + id + ")"))
            );
        }

        // 2) Agrupar cantidades por (productoId|talle) para validar stock una sola vez
        Map<String, Integer> cantidadesPorVariante = new HashMap<>();
        for (CheckoutItem it : req.items()) {
            String key = it.productoId() + "|" + it.talle().name();
            cantidadesPorVariante.merge(key, it.cantidad(), Integer::sum);
        }

        // 3) Lock + validación de stock por variante
        Map<String, ProductoTalle> variantesBloqueadas = new HashMap<>();
        for (var entry : cantidadesPorVariante.entrySet()) {
            String[] parts = entry.getKey().split("\\|");
            Long productoId = Long.valueOf(parts[0]);
            var talle = req.items().stream()
                    .filter(i -> i.productoId().equals(productoId)
                              && (productoId + "|" + i.talle().name()).equals(entry.getKey()))
                    .findFirst().get().talle();

            ProductoTalle variante = productoTalleRepository
                    .findByProductoIdAndTalleForUpdate(productoId, talle)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Variante no encontrada: producto " + productoId + " talle " + talle));

            int solicitada = entry.getValue();
            if (solicitada <= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La cantidad debe ser mayor a 0");
            if (variante.getStock() < solicitada) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Stock insuficiente para producto " + productoId + " talle " + talle
                                + " (disponible=" + variante.getStock() + ", solicitado=" + solicitada + ")"
                );
            }
            variantesBloqueadas.put(entry.getKey(), variante);
        }

        // 4) Armar líneas, descontar stock y calcular totales con descuento
        List<CheckoutResponse.CheckoutLine> lines = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CheckoutItem it : req.items()) {
            Producto producto = productos.get(it.productoId());
            String key = it.productoId() + "|" + it.talle().name();
            ProductoTalle variante = variantesBloqueadas.get(key);

            // Descontar stock de ESTA línea (no de la sumada)
            variante.setStock(variante.getStock() - it.cantidad());

            // Snapshot de precios y descuento
            BigDecimal precioOriginal = BigDecimal.valueOf(producto.getPrecio()).setScale(2, RoundingMode.HALF_UP);
            int d = (producto.getDescuentoPct() == null) ? 0 : producto.getDescuentoPct();

            BigDecimal precioFinal = precioOriginal
                    .multiply(BigDecimal.valueOf(100 - d))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            BigDecimal subtotal = precioFinal.multiply(BigDecimal.valueOf(it.cantidad()))
                                             .setScale(2, RoundingMode.HALF_UP);
            total = total.add(subtotal);

            lines.add(new CheckoutResponse.CheckoutLine(
                    producto.getId(),
                    producto.getNombre(),
                    it.talle(),
                    it.cantidad(),
                    precioOriginal,        // snapshot
                    d,                     // % aplicado
                    precioFinal,           // unitario luego de descuento
                    subtotal               // final por línea
            ));
        }

        // 5) Persistir cambios de stock (JPA dirty checking + saveAll por si acaso)
        productoTalleRepository.saveAll(new HashSet<>(variantesBloqueadas.values()));

        return new CheckoutResponse(lines, total.setScale(2, RoundingMode.HALF_UP));
    }
}
