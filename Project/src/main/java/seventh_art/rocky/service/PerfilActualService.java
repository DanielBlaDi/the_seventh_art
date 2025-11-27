package seventh_art.rocky.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;

@Service
@RequiredArgsConstructor
public class PerfilActualService {

    private final UsuarioService usuarioService;
    private final PerfilRepository perfilRepository;

    public Perfil getCurrentPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        String email = auth.getName();          // viene del login (UsernamePasswordAuthenticationToken)
        Usuario usuario = usuarioService.findByEmail(email);

        return perfilRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalStateException("Perfil not found for user: " + email));
    }
}
