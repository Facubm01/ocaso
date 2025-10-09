package com.example.uade.tpo.TiendaRopa.repository;

import com.example.uade.tpo.TiendaRopa.entity.ProductoTalle;
import com.example.uade.tpo.TiendaRopa.entity.Talle;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ProductoTalleRepository extends JpaRepository<ProductoTalle, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
           select pt from ProductoTalle pt
           where pt.producto.id = :productoId
             and pt.talle = :talle
           """)
    Optional<ProductoTalle> findByProductoIdAndTalleForUpdate(Long productoId, Talle talle);
}
