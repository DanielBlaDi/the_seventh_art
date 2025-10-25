package seventh_art.rocky.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import seventh_art.rocky.repository.UsuarioRepository;

@Controller
@RequiredArgsConstructor
public class HolaMundo {

    private final UsuarioRepository repo;

    @GetMapping({"/", ""})
    public String hola(Model m) {
        m.addAttribute("mensaje", "Hola Mundo");
        m.addAttribute("usuarios", repo.findAll()); // solo lectura
        return "home/index"; // tu única vista
    }
}



