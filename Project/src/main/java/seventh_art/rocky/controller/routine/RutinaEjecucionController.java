package seventh_art.rocky.controller.routine;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import seventh_art.rocky.dto.RutinaFinalizadaDTO;
import seventh_art.rocky.service.routines.RutinaEjecucionService;

@RestController
@RequestMapping("/api/rutinas")
@RequiredArgsConstructor
public class RutinaEjecucionController {

    private final RutinaEjecucionService rutinaEjecucionService;

    @PostMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizarRutina(
            @PathVariable Long id,
            @RequestBody RutinaFinalizadaDTO dto
    ) {
        dto.setRutinaId(id);
        rutinaEjecucionService.registrarEjecucion(dto);
        return ResponseEntity.ok().build();
    }

}
