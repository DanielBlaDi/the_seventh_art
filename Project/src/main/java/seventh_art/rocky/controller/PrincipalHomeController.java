package seventh_art.rocky.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.ActividadRecienteDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.HistoriaService;
import seventh_art.rocky.service.MensajeService;
import seventh_art.rocky.service.profile.PerfilActualService;

@Controller
@RequiredArgsConstructor
public class PrincipalHomeController {

    private final PerfilActualService perfilActualService;
    private final HistoriaService historiaService;
    private final MensajeService mensajeService;

    @GetMapping("/principal_home")
    public String mostrarPrincipalHome(Model model) {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        List<ActividadRecienteDTO> actividadesRecientes = historiaService.listarRutinasActuales();
        String mensajeDelDia = mensajeService.getMensaje();

        model.addAttribute("perfil", perfil);
        model.addAttribute("actividadesRecientes", actividadesRecientes);
        model.addAttribute("mensajeDelDia", mensajeDelDia);

        return "home/principal_home"; // busca templates/home/principal_home.html
    }
}
