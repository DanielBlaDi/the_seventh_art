package seventh_art.rocky.controller.achievement;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.achievement.LogroConProgresoDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.achievement.LogroService;
import seventh_art.rocky.service.profile.PerfilActualService;

@Controller
@RequiredArgsConstructor
public class LogroController {

    private final PerfilActualService perfilActualService;
    private final LogroService logroService;

    @GetMapping("/perfil/logros")
    public String mostrarLogrosPerfilActual(Model model) {

        Perfil perfil = perfilActualService.getCurrentPerfil();

        List<LogroConProgresoDTO> logrosConProgreso =
                logroService.getLogrosConProgreso(perfil.getId());

        long logrosCompletados = logrosConProgreso.stream()
                .filter(LogroConProgresoDTO::isCompletado)
                .count();

        int totalLogros = logrosConProgreso.size();

        // === PORCENTAJE GLOBAL ===
        int porcentajeGlobal;
        if (totalLogros == 0) {
        porcentajeGlobal = 0;
        } else {
        porcentajeGlobal = (int) Math.round(logrosCompletados * 100.0 / totalLogros);
        }

        model.addAttribute("perfil", perfil);
        model.addAttribute("logros", logrosConProgreso);
        model.addAttribute("logrosCompletados", logrosCompletados);
        model.addAttribute("totalLogros", totalLogros);
        model.addAttribute("porcentajeGlobal", porcentajeGlobal);

        return "home/profile/logros";
    }
}
