package seventh_art.rocky.service.auth;

import java.io.IOException;
import java.util.Optional;

import seventh_art.rocky.dto.RegistroDTO;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;

import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import seventh_art.rocky.service.RegistroService;

@Component
public class CustomLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UsuarioRepository usuarioRepository;
    private final RegistroService registroService;

    public CustomLoginSuccessHandler(UsuarioRepository usuarioRepository,
                                     RegistroService registroService) {
        this.usuarioRepository = usuarioRepository;
        this.registroService = registroService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
                                        throws IOException {

        HttpSession session = request.getSession();
        String email = authentication.getName();
        Optional<Usuario> usuario = usuarioRepository.findByEmailIgnoreCase(email);

        // ----------------------------------------
        // 1. PRIORIDAD: ¿Está el usuario en registro INCOMPLETO?
        // ----------------------------------------
        Long usuarioRegistroId = (Long) session.getAttribute("usuarioRegistroId");
        RegistroDTO dto = (RegistroDTO) session.getAttribute("registroDTO");

        if (usuarioRegistroId != null && dto == null) {
            // El usuario está en proceso de registro pero no ha completado el perfil
            System.out.println("Redirigiendo a paso2 por registro incompleto... | Condición 1");
            response.sendRedirect("/registro/cuenta-creada");
            return;
        }

        // ----------------------------------------
        // 2. ¿El usuario NO ha completado su perfil en la BD?
        // ----------------------------------------
        if (usuario.isPresent() && !registroService.esPerfilCompleto(usuario.get())) {  
            // método que tú implementas basado en tus reglas:
            // nombre, apellido, edad, objetivo, etc.
            System.out.println("Redirigiendo a paso2 por registro incompleto... | Condición 2");
            response.sendRedirect("/registro/paso2");
            return;
        }

        // ----------------------------------------
        // 3. Usuario con registro completo → Home
        // ----------------------------------------
        response.sendRedirect("/principal_home");
    }
}
