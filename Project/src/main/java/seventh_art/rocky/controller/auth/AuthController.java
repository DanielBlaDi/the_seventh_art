package seventh_art.rocky.controller.auth;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import seventh_art.rocky.service.UsuarioService;
import org.springframework.web.bind.annotation.ModelAttribute;
import seventh_art.rocky.entity.Usuario;

@Controller
public class AuthController {
    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService){this.usuarioService = usuarioService;}

    @GetMapping("/login") // En esta dirección de url se carga la vista del login
    public String MostrarLogin() {
        return "auth/login"; // Muestra la vista
    }

    @PostMapping("/login") //Recibe los datos enviados del Html por metodo POST
    public String procesarLogin(@RequestParam String email, @RequestParam String password, Model model){
        boolean ok = usuarioService.login(email, password);
        if(ok){
            return "redirect:/"; //redirigir a home, CUANDO SE CREE ESA VISTA
        } else {
            System.out.println("Credenciales incorrectas!!");
            model.addAttribute("ErroCredenciales", "Las credenciales no coiciden.");
            return "auth/login";
        }
    }

    @GetMapping("/registro")
    public String mostrarRegistro(){
        return "auth/register";
    }

    @PostMapping("/registro")
    public String procesarRegistro(@ModelAttribute Usuario usuario, Model model){
        try {
            usuarioService.crear(usuario);
            System.out.println("Usuario creado correctamente!");
            return "redirect:/login";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return "/registro";
        }
    }

}
