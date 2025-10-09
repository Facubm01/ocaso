package com.example.uade.tpo.TiendaRopa.service;

import com.example.uade.tpo.TiendaRopa.entity.Image;
import com.example.uade.tpo.TiendaRopa.repository.ImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service @RequiredArgsConstructor
public class ImageServiceImpl implements ImageService {
  private final ImageRepository repo;

  @Override
  public Image save(MultipartFile file) throws Exception {
    Image img = new Image();
    img.setFilename(file.getOriginalFilename());
    img.setContentType(file.getContentType());
    img.setData(file.getBytes());
    return repo.save(img);
  }

  @Override
  public Image get(Long id) {
    return repo.findById(id).orElseThrow();
  }
}
