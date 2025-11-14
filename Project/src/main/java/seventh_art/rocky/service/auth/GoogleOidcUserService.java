package seventh_art.rocky.service.auth;

import java.util.Set;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import seventh_art.rocky.service.UsuarioService;

@Service
public class GoogleOidcUserService extends OidcUserService {

    private final UsuarioService usuarioService;

    public GoogleOidcUserService(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
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
        usuarioService.registrarGoogleUsuarioSiNoExiste(email);
        System.out.println("Usuario Google registrado: " + email);

        // Crear un usuario con rol ROLE_USER
        return new DefaultOidcUser(
                Set.of(new SimpleGrantedAuthority("ROLE_USER")),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "sub"  // atributo usado como "username" interno
        );
    }
}