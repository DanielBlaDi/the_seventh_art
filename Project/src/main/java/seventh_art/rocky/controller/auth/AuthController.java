package seventh_art.rocky.controller.auth;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.service.UsuarioService;

@Controller
public class AuthController {

    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UsuarioService usuarioService,
                          AuthenticationManager authenticationManager) {
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
    }

    // ---- LOGIN ---- //
    @GetMapping("/login") // En esta dirección de url se carga la vista del login
    public String MostrarLogin() {
        return "auth/login"; // Muestra la vista
    }

    @PostMapping("/login")
    public String procesarLogin(@RequestParam String email,
                                @RequestParam String password,
                                HttpServletRequest request,
                                Model model) {
        try {
            Authentication authRequest =
                    new UsernamePasswordAuthenticationToken(email, password);
            Authentication authResult = authenticationManager.authenticate(authRequest);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authResult);
            SecurityContextHolder.setContext(context);
            request.getSession(true).setAttribute(
                    HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context
            );

            return "redirect:/principal_home";   //Página del home
        } catch (AuthenticationException ex) {
            model.addAttribute("ErroCredenciales", "Credenciales inválidas");
            return "auth/login";
        }
    }

    // ---- REGISTRO PASO 1 (USUARIO) ---- //
    @GetMapping("/registro")
    public String mostrarRegistro() {
        return "register/register"; // tu vista de paso 1 (email + password)
    }

    @PostMapping("/registro")
    public String procesarRegistro(@ModelAttribute Usuario usuario,
                                   Model model,
                                   HttpSession session) {
        try {
            System.out.println("Usuario creado correctamente!");
            Usuario creado = usuarioService.crear(usuario);
            session.setAttribute("usuarioRegistroId", creado.getId());

            return "redirect:/registro/cuenta-creada";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return "/registro";
        }
    }
}

