package seventh_art.rocky.controller.routine;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import seventh_art.rocky.dto.RutinaDTO;
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
}
