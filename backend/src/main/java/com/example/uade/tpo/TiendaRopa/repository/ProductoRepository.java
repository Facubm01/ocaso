package com.example.uade.tpo.TiendaRopa.repository;

import com.example.uade.tpo.TiendaRopa.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    // Productos que tengan al menos una variante con stock > 0
    @Query("""
           select p from Producto p
           where exists (
              select t from ProductoTalle t
              where t.producto = p and t.stock > 0
           )
           """)
    List<Producto> findAllConAlgunaVarianteDisponible();

    @Query("""
           select p from Producto p
           where p.categoria.id = :categoriaId
             and exists (
               select t from ProductoTalle t
               where t.producto = p and t.stock > 0
             )
           """)
    List<Producto> findByCategoriaConAlgunaVarianteDisponible(Long categoriaId);

}
