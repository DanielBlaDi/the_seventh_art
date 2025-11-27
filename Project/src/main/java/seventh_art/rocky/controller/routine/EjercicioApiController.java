package seventh_art.rocky.controller.routine;

import org.springframework.web.bind.annotation.*;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.TipoEjercicio;
import seventh_art.rocky.service.routines.EjercicioService;

import java.util.List;

@RestController
@RequestMapping("/api/ejercicios")
public class EjercicioApiController {

    private final EjercicioService ejercicioService;

    public EjercicioApiController(EjercicioService ejercicioService) {
        this.ejercicioService = ejercicioService;
    }

    @GetMapping
    public List<Ejercicio> listar(
            @RequestParam(required = false, name = "tipo") TipoEjercicio tipo) {

        if (tipo != null && tipo != TipoEjercicio.FULL_BODY && tipo != TipoEjercicio.OTRO) {
            return ejercicioService.listarPorTipo(tipo);
        }
        return ejercicioService.listarTodos();
    }
}
