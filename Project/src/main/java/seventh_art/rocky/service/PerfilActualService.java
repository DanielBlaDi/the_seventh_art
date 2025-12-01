package seventh_art.rocky.service;

import java.time.LocalDate;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.config.UsuarioPrincipal;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;

@Service
@RequiredArgsConstructor
public class PerfilActualService {

    private final UsuarioService usuarioService;
    private final PerfilRepository perfilRepository;
    private final LocalDate fechaActual = LocalDate.now();

    public Perfil getCurrentPerfil() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        final String email = extractEmailFromAuthentication(auth);

        Usuario usuario = usuarioService.findByEmail(email);

        return perfilRepository.findByUsuario(usuario)
                .orElseThrow(() -> new IllegalStateException("Perfil not found for user: " + email));
    }

    private String extractEmailFromAuthentication(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof UsuarioPrincipal up) {
            return up.getUsername();
        } else if (principal instanceof OidcUser o) {
            return o.getEmail();
        } else {
            return auth.getName(); // fallback
        }
    }

    public int getRachaActual() {
        Perfil perfil = getCurrentPerfil();
        return perfil.getRachaActual();
    }

    public void astualizarRachaActual() {
        Perfil perfil = getCurrentPerfil();
        //llamar a metodo que me retorna la cantidad de dias consecutivos entrenados

        //perfil.setRachaActual();

        perfilRepository.save(perfil);
    }

    public void resetearRachaActual() {
        Perfil perfil = getCurrentPerfil();
        perfil.setRachaActual(0);
        perfilRepository.save(perfil);
    }

    public LocalDate getFechaActual() {
        return fechaActual;
    }
}