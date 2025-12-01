package seventh_art.rocky.controller.profile;

import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import seventh_art.rocky.dto.PerfilEdicionDTO;
import seventh_art.rocky.dto.achievement.LogroConProgresoDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.achievement.LogroService;
import seventh_art.rocky.service.profile.PerfilActualService;
import seventh_art.rocky.service.profile.PerfilService;

import java.util.List;

@Controller
public class PerfilController {

    private final PerfilActualService perfilActualService;
    private final PerfilService perfilService;
    private final LogroService logroService;   // <-- NUEVO

    public PerfilController(PerfilActualService perfilActualService,
                            PerfilService perfilService,
                            LogroService logroService) {     // <-- NUEVO
        this.perfilActualService = perfilActualService;
        this.perfilService = perfilService;
        this.logroService = logroService;       // <-- NUEVO
    }

    /**
     * Muestra el perfil del usuario logueado.
     */
    @GetMapping("/perfil")
    public String mostrarPerfil(Model model) {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        Float pesoActual = perfilActualService.getPesoActual();

        model.addAttribute("perfil", perfil);
        model.addAttribute("pesoActual", pesoActual);

        // ======== NUEVO: Progreso de Logros ========
        List<LogroConProgresoDTO> logros = 
                logroService.getLogrosConProgreso(perfil.getId());

        long logrosCompletados = logros.stream()
                .filter(LogroConProgresoDTO::isCompletado)
                .count();

        int totalLogros = logros.size();

        int porcentajeGlobal;
        if (totalLogros == 0) {
            porcentajeGlobal = 0;
        } else {
            porcentajeGlobal = (int) Math.round(logrosCompletados * 100.0 / totalLogros);
        }

        long logrosFaltantes = totalLogros - logrosCompletados;

        model.addAttribute("logrosCompletados", logrosCompletados);
        model.addAttribute("totalLogros", totalLogros);
        model.addAttribute("porcentajeGlobal", porcentajeGlobal);
        model.addAttribute("logrosFaltantes", logrosFaltantes);
        // ======== FIN DE NUEVO BLOQUE ========

        return "home/profile/perfil";
    }

    /**
     * Muestra el formulario de edición del perfil.
     */
    @GetMapping("/perfil/editar")
    public String mostrarFormularioEdicion(Model model) {
        Perfil perfil = perfilActualService.getCurrentPerfil();

        PerfilEdicionDTO dto = new PerfilEdicionDTO();
        dto.setNombre(perfil.getNombre());
        dto.setApellido(perfil.getApellido());
        dto.setEdad(perfil.getEdad());
        dto.setEstatura(perfil.getEstatura());
        dto.setObjetivo(perfil.getObjetivo());
        dto.setRachaDeseada(perfil.getRachaDeseada());

        model.addAttribute("perfilEdicionDTO", dto);

        return "home/profile/perfil-edicion";
    }

    /**
     * Procesa los cambios enviados desde el formulario.
     */
    @PostMapping("/perfil/editar")
    public String procesarEdicion(
            @Valid @ModelAttribute("perfilEdicionDTO") PerfilEdicionDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            return "home/profile/perfil-edicion";
        }

        perfilService.actualizarPerfilActual(dto);

        return "redirect:/perfil";
    }
}
