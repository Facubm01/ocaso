package com.example.uade.tpo.TiendaRopa.entity;

import jakarta.persistence.*;
import lombok.*;

@Data @Entity @Table(name = "images")
@NoArgsConstructor @AllArgsConstructor
public class Image {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Lob @Basic(fetch = FetchType.LAZY)
  @Column(name = "data", columnDefinition = "LONGBLOB")
  private byte[] data;

  @Column(length = 120)
  private String contentType; // "image/jpeg", "image/png", etc.

  @Column(length = 200)
  private String filename;
}
