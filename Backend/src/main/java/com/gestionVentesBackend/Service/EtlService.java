package com.gestionVentesBackend.Service;

import com.gestionVentesBackend.dto.EtlRunResponseDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Service ETL:
 * - sauvegarde un CSV dans data/uploads
 * - exécute le script Python ETL via ProcessBuilder
 */
@Service
public class EtlService {

    @Value("${etl.uploadDir:data/uploads}")
    private String uploadDir;

    @Value("${etl.pythonCommand:python}")
    private String pythonCommand;

    @Value("${etl.scriptPath:../gestionventesdata/etl/etl_pipeline.py}")
    private String scriptPath;

    @Value("${etl.produitsScriptPath:../gestionventesdata/etl/etl_produits.py}")
    private String produitsScriptPath;

    /**
     * SQLAlchemy DB URL (ex: mysql+pymysql://user:pwd@host:3306/db ou postgresql+psycopg://...)
     */
    @Value("${etl.databaseUrl:}")
    private String databaseUrl;

    @Value("${etl.timeoutSeconds:600}")
    private long timeoutSeconds;

    public EtlRunResponseDTO uploadAndRun(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier CSV manquant");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "data.csv");
        if (!original.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException("Format invalide: veuillez envoyer un fichier .csv");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier d'upload: " + uploadPath, e);
        }

        String safeName = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String uniqueName = Instant.now().toEpochMilli() + "_" + UUID.randomUUID() + "_" + safeName;
        Path savedFile = uploadPath.resolve(uniqueName);

        try {
            Files.copy(file.getInputStream(), savedFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erreur sauvegarde CSV: " + e.getMessage(), e);
        }

        // Détecter le type de fichier pour choisir le bon script
        String scriptToUse = detectScriptType(savedFile);

        long start = System.currentTimeMillis();
        Process process;
        String stdout;
        String stderr;
        Integer exitCode = null;
        String status;

        try {
            List<String> command = buildCommand(savedFile, scriptToUse);
            ProcessBuilder pb = new ProcessBuilder(command);

            if (databaseUrl != null && !databaseUrl.isBlank()) {
                pb.environment().put("DATABASE_URL", databaseUrl);
            }
            pb.environment().put("ETL_INPUT", savedFile.toString());

            process = pb.start();

            stdout = readStream(process.getInputStream(), 20000);
            stderr = readStream(process.getErrorStream(), 20000);

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                status = "TIMEOUT";
            } else {
                exitCode = process.exitValue();
                status = exitCode == 0 ? "SUCCESS" : "FAILED";
            }

        } catch (Exception e) {
            stdout = "";
            stderr = e.getMessage();
            status = "FAILED";
        }

        long durationMs = System.currentTimeMillis() - start;

        return EtlRunResponseDTO.builder()
                .status(status)
                .savedFilePath(savedFile.toString())
                .exitCode(exitCode)
                .durationMs(durationMs)
                .stdout(stdout)
                .stderr(stderr)
                .build();
    }

    /**
     * Détecte le type de fichier CSV (produits ou ventes) en lisant l'en-tête
     */
    private String detectScriptType(Path csvFile) {
        try {
            List<String> lines = Files.readAllLines(csvFile, StandardCharsets.UTF_8);
            if (!lines.isEmpty()) {
                String header = lines.get(0).toLowerCase();
                // Si on trouve les colonnes typiques des produits
                if (header.contains("stock") && header.contains("prix") && 
                    header.contains("categorie") && !header.contains("client")) {
                    return produitsScriptPath;
                }
            }
        } catch (IOException e) {
            // En cas d'erreur, utiliser le script par défaut
        }
        // Par défaut, utiliser le script de ventes
        return scriptPath;
    }

    private List<String> buildCommand(Path savedFile, String scriptToUse) {
        List<String> cmd = new ArrayList<>();

        // Permet de configurer pythonCommand = "py" sous Windows ou "python3" sous Linux.
        cmd.add(pythonCommand);
        cmd.add(Paths.get(scriptToUse).toAbsolutePath().normalize().toString());

        cmd.add("--input");
        cmd.add(savedFile.toAbsolutePath().normalize().toString());

        return cmd;
    }

    private String readStream(InputStream stream, int maxChars) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (sb.length() + line.length() + 1 > maxChars) {
                    sb.append("\n...[TRUNCATED]...");
                    break;
                }
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }
}
