package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.entity.Image;
import org.springframework.web.multipart.MultipartFile;

public interface ImageService {
  Image save(MultipartFile file) throws Exception;
  Image get(Long id);
}
