package seventh_art.rocky.controller; 

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RutinasController {

    /**
     * Mapea la URL /rutinas a la vista de Rutinas.
     * @return La ruta de la plantilla a renderizar (src/main/resources/templates/home/rutinas.html).
     */
    @GetMapping("/rutinas")
    public String mostrarRutinas() {
        // Retorna "home/rutinas" siguiendo la convención de PrincipalHomeController
        return "home/rutinas/rutinas";
    }
}