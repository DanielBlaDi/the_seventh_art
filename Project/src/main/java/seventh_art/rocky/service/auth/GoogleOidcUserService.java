package seventh_art.rocky.service.auth;

import java.util.Set;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpSession;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.service.RegistroService;
import seventh_art.rocky.service.UsuarioService;

@Service
public class GoogleOidcUserService extends OidcUserService {

    private final UsuarioService usuarioService;
    private final RegistroService registroService;
    private final HttpSession session;

    public GoogleOidcUserService(UsuarioService usuarioService, RegistroService registroService, HttpSession session) {
        this.usuarioService = usuarioService;
        this.registroService = registroService;
        this.session = session;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        System.out.println(">>> ENTRO A GoogleOidcUserService.loadUser <<<");

        // Delega primero al comportamiento por defecto (pide los datos a Google)
        OidcUser oidcUser = super.loadUser(userRequest);

        // Obtenemos los datos de la cuenta de Google
        String email  = oidcUser.getEmail();                 
        System.out.println(">>> EMAIL: " + email + " <<<");

        // Registrar el usuario en la base de datos si no existe
        Usuario usuario = usuarioService.registrarGoogleUsuarioSiNoExiste(email);
        
        // Guardar en sesión para detectar perfil incompleto
        if (!registroService.esPerfilCompleto(usuario)) {
            session.setAttribute("usuarioRegistroId", usuario.getId());
        }
        
        
        System.out.println("Usuario Google registrado: " + email);
        System.out.println(">>> usuarioRegistroId guardado en sesión: " + usuario.getId());

        // Crear un usuario con rol ROLE_USER
        return new DefaultOidcUser(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "sub"  // atributo usado como "username" interno
        );
    }
}