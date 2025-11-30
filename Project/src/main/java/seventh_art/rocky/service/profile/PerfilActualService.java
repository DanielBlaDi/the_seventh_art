package seventh_art.rocky.service.profile;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PesoRepository;
import seventh_art.rocky.repository.PerfilRepository;
import seventh_art.rocky.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PerfilActualService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PesoRepository pesoRepository;

    /**
     * Obtiene el Usuario autenticado (local o Google OIDC).
     */
    private Usuario getCurrentUsuario() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || auth.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado en el contexto.");
        }

        Object principal = auth.getPrincipal();
        String email;

        // -----------------------------------------
        // 1. LOGIN LOCAL (username = email)
        // -----------------------------------------
        if (principal instanceof org.springframework.security.core.userdetails.User user) {
            email = user.getUsername();
        }
        // -----------------------------------------
        // 2. LOGIN GOOGLE OIDC
        // -----------------------------------------
        else if (principal instanceof org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser oidcUser) {
            email = oidcUser.getEmail();
        }
        // -----------------------------------------
        // 3. Otros casos inesperados
        // -----------------------------------------
        else {
            throw new RuntimeException("Tipo de autenticación no soportado: " + principal.getClass());
        }

        // Buscar usuario en BD
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado en BD: " + email));
    }

    /**
     * Obtiene el Perfil del usuario autenticado.
     */
    public Perfil getCurrentPerfil() {
        Usuario usuario = getCurrentUsuario();

        return perfilRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Perfil no encontrado"));
    }

    /**
     * Obtiene el último peso registrado del usuario.
     */
    public Float getPesoActual() {

        Perfil perfil = getCurrentPerfil();

        return pesoRepository
                .findFirstByPerfilIdOrderByFechaDesc(perfil.getId())
                .map(p -> p.getValor())
                .orElse(null);
    }
}
