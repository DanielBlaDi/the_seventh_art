package seventh_art.rocky.controller.routine;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import seventh_art.rocky.dto.RutinaDTO;
import seventh_art.rocky.dto.RutinaDetalleDTO;
import seventh_art.rocky.entity.Rutina;
import seventh_art.rocky.service.routines.RutinaService;

@RestController
@RequestMapping("/api/rutinas")
@RequiredArgsConstructor
public class RutinaController {

    private final RutinaService rutinaService;

    @PostMapping
    public ResponseEntity<?> crearRutina(@RequestBody @Valid RutinaDTO request) {
        Rutina creada = rutinaService.crear(request);
        return ResponseEntity.ok(creada.getId());
    }

    @GetMapping("/mias")
    public ResponseEntity<?> listarMisRutinas() {
        return ResponseEntity.ok(rutinaService.listarRutinasPerfilActual());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRutina(@PathVariable Long id) {
        rutinaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutinaDetalleDTO> obtenerDetalleRutina(@PathVariable Long id) {
        return ResponseEntity.ok(rutinaService.obtenerRutinaConDetalles(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> actualizarRutina(@PathVariable Long id, @RequestBody @Valid RutinaDTO request) {
        rutinaService.actualizarRutina(id, request);
        return ResponseEntity.noContent().build();
    }
}
