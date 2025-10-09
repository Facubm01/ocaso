package com.example.uade.tpo.TiendaRopa.controllers.productos;

import com.example.uade.tpo.TiendaRopa.controllers.talleStock.ProductoTalleResponse;
import com.example.uade.tpo.TiendaRopa.entity.Producto;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoResponse {

  private Long id;
  private String nombre;

  // Precios y descuento
  private double precioOriginal;    // antes: "precio"
  private Integer descuentoPct;     // 0..90 (si null => 0)
  private double precioFinal;       // calculado = precioOriginal * (1 - d/100)

  private int stockTotal;
  private Long categoriaId;
  private String descripcion;
  private Long imageId;  // opcional
  private List<Long> imageIds;  // opcional, galería
  private List<ProductoTalleResponse> talles;

  public static ProductoResponse from(Producto p) {
    int d = (p.getDescuentoPct() == null) ? 0 : p.getDescuentoPct();
    double finalCalc = calcularPrecioFinal(p.getPrecio(), d);

    return ProductoResponse.builder()
        .id(p.getId())
        .nombre(p.getNombre())
        .precioOriginal(p.getPrecio())
        .descuentoPct(d)
        .precioFinal(finalCalc)
        .stockTotal(p.getStockTotal())
        .categoriaId(p.getCategoria() != null ? p.getCategoria().getId() : null)
        .descripcion(p.getDescripcion())
        .imageId(p.getImageId())
        .imageIds(p.getImageIds())
        .talles(p.getTalles().stream().map(ProductoTalleResponse::from).toList())
        .build();
  }

  private static double calcularPrecioFinal(double precioOriginal, int descuentoPct) {
    BigDecimal base = BigDecimal.valueOf(precioOriginal);
    BigDecimal factor = BigDecimal.valueOf(100 - descuentoPct)
        .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
    return base.multiply(factor).setScale(2, RoundingMode.HALF_UP).doubleValue();
  }
}
