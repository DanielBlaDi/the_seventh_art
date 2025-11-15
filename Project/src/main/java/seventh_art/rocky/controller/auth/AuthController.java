package seventh_art.rocky.controller.auth;

import org.springframework.security.core.AuthenticationException;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;
import seventh_art.rocky.service.UsuarioService;
import org.springframework.web.bind.annotation.ModelAttribute;
import seventh_art.rocky.entity.Usuario;

@Controller
public class AuthController {
    private final UsuarioService usuarioService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UsuarioService usuarioService, AuthenticationManager authenticationManager){
        this.usuarioService = usuarioService;
        this.authenticationManager = authenticationManager;
    }

//---- RUTAS DE AUTENTICACIÓN ----//
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

            // Realizar un mensaje login exitoso
            // Mostrarlo en la vista de login por 2 segundos antes de redirigir al home

            return "redirect:/prueba";   //Redirigir a la pagina del Home - Tiene el botón de logout
        } catch (AuthenticationException ex) {

            //Mostrar mensaje de error en la verificación de credenciales
            model.addAttribute("ErroCredenciales", "Credenciales inválidas");
            return "auth/login";
        }
    }

//---- RUTAS DE REGISTRO DE USUARIOS ----//
    @GetMapping("/registro")
    public String mostrarRegistro(){
        return "register/register";
    }

    @PostMapping("/registro")
    public String procesarRegistro(@ModelAttribute Usuario usuario, Model model){
        try {
            usuarioService.crear(usuario);
            System.out.println("Usuario creado correctamente!");
            return "redirect:/registro/cuenta-creada";   // Redirigir a la vista de cuenta creada
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            return "register/register";
        }
    }

    @GetMapping("/registro/cuenta-creada")      //Esta es el endpoint
    public String mostrarCuentaCreada() {
        return "register/cuenta-creada";        //Esta es la ruta en el templates del proyecto
    }

//---- Editar estas rutas posteriormente | rutas del home | crear controller para el home ----// 

    // Vista de prueba del home después del login
    @GetMapping("/prueba")
    public String mostrarHomePrueba() {
        System.out.println("Has llegado al home de prueba tras el login");
        return "home/prueba";
    }

    @GetMapping("/registro/profile-data")
    public String mostrarRegistroProfileData() {
        System.out.println("Has llegado al home principal");
        return "register/profile-data"; // ruta en donde se pondrá el formulario de datos despues de crear la cuenta
    }

}
