package seventh_art.rocky.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;
import seventh_art.rocky.repository.UsuarioRepository;

@Service
@RequiredArgsConstructor
public class PerfilActualService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;

    public Perfil getCurrentPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        String email = auth.getName();          // viene del login (UsernamePasswordAuthenticationToken)
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalStateException("Usuario not found with email: " + email));

        return perfilRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalStateException("Perfil not found for user: " + email));
    }
}
