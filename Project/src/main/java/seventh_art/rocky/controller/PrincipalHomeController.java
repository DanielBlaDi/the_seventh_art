package seventh_art.rocky.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import seventh_art.rocky.dto.ActividadRecienteDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.HistoriaService;
import seventh_art.rocky.service.PerfilActualService;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class PrincipalHomeController {

    private final PerfilActualService perfilActualService;
    private final HistoriaService historiaService;

    @GetMapping("/principal_home")
    public String mostrarPrincipalHome(Model model) {

        Perfil perfil = perfilActualService.getCurrentPerfil();
        List<ActividadRecienteDTO> actividadesRecientes = historiaService.listarRutinasActuales();

        model.addAttribute("perfil", perfil);
        model.addAttribute("actividadesRecientes", actividadesRecientes);

        return "home/principal_home"; // busca templates/home/principal_home.html
    }
}
