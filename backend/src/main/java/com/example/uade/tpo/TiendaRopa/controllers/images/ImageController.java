package com.example.uade.tpo.TiendaRopa.controllers.images;

import com.example.uade.tpo.TiendaRopa.entity.Image;
import com.example.uade.tpo.TiendaRopa.service.ImageService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ImageController {

  private final ImageService service;

  // Sube un archivo y devuelve el id
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ImageResponse> upload(@RequestParam("file") MultipartFile file) throws Exception {
    Image img = service.save(file);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new ImageResponse(img.getId(), null));
  }

  // Devuelve base64 (para que el front decodee)
  @GetMapping
  public ResponseEntity<ImageResponse> getBase64(@RequestParam("id") Long id) {
    Image img = service.get(id);
    String b64 = Base64.getEncoder().encodeToString(img.getData());
    return ResponseEntity.ok(new ImageResponse(img.getId(), b64));
  }

  // (Opcional) crudo como imagen -> <img src="/api/images/12/raw">
  @GetMapping("/{id}/raw")
  public ResponseEntity<byte[]> getRaw(@PathVariable Long id) {
    Image img = service.get(id);
    MediaType mt = (img.getContentType() != null)
        ? MediaType.parseMediaType(img.getContentType())
        : MediaType.IMAGE_JPEG;
    return ResponseEntity.ok().contentType(mt).body(img.getData());
  }
}
