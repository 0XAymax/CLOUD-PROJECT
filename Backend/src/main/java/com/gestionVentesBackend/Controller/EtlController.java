package com.gestionVentesBackend.Controller;

import com.gestionVentesBackend.Service.EtlService;
import com.gestionVentesBackend.dto.EtlRunResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller ETL:
 * - Upload CSV (MultipartFile)
 * - Sauvegarde locale (data/uploads)
 * - Déclenche le pipeline Python ETL
 */
@RestController
@RequestMapping("/api/etl")
@CrossOrigin(origins = "${app.cors.origins}")
public class EtlController {

    @Autowired
    private EtlService etlService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadAndAnalyze(@RequestParam("file") MultipartFile file) {
        try {
            EtlRunResponseDTO result = etlService.uploadAndRun(file);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Erreur ETL: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }
}
