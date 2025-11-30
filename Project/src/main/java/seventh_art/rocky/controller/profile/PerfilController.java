package seventh_art.rocky.controller.profile;

import jakarta.validation.Valid;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import seventh_art.rocky.dto.PerfilEdicionDTO;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.service.profile.PerfilActualService;
import seventh_art.rocky.service.profile.PerfilService;

@Controller
public class PerfilController {

    private final PerfilActualService perfilActualService;
    private final PerfilService perfilService;

    public PerfilController(PerfilActualService perfilActualService,
                            PerfilService perfilService) {
        this.perfilActualService = perfilActualService;
        this.perfilService = perfilService;
    }


    @GetMapping("/perfil")
    public String mostrarPerfil(Model model) {
        Perfil perfil = perfilActualService.getCurrentPerfil();
        model.addAttribute("perfil", perfil);
        return "home/profile/perfil";
    }


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
