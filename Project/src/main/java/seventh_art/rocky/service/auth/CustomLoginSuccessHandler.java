package seventh_art.rocky.service.auth;

import java.io.IOException;
import java.util.Optional;

import seventh_art.rocky.dto.RegistroDTO;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.UsuarioRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

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

        // ------------------------------------------------------
        // 1. Obtener el email dependiendo del tipo de autenticación
        // ------------------------------------------------------
        String email;

        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            // Login por Google OAuth
            email = oidcUser.getEmail();
        } else {
            // Login normal por formulario
            email = authentication.getName();
        }

        Optional<Usuario> usuario = usuarioRepository.findByEmailIgnoreCase(email);

        // ----------------------------------------
        // 2. PRIORIDAD: ¿Registro incompleto en sesión?
        // ----------------------------------------
        Long usuarioRegistroId = (Long) session.getAttribute("usuarioRegistroId");
        RegistroDTO dto = (RegistroDTO) session.getAttribute("registroDTO");

        if (usuarioRegistroId != null && dto == null) {
            System.out.println("Redirigiendo a paso2 por session registro incompleto...");
            response.sendRedirect("/registro/paso2");
            return;
        }

        // ----------------------------------------
        // 3. Usuario encontrado pero con perfil incompleto
        // ----------------------------------------
        if (usuario.isPresent() && !registroService.esPerfilCompleto(usuario.get())) {
            System.out.println("Redirigiendo a paso2 por perfil incompleto en BD...");
            response.sendRedirect("/registro/paso2");
            return;
        }

        // ----------------------------------------
        // 4. Usuario completamente registrado → Home
        // ----------------------------------------
        response.sendRedirect("/principal_home");
    }
}
