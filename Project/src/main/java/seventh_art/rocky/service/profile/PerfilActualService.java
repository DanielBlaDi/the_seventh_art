package seventh_art.rocky.service.profile;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.RachaDTO;
import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Usuario;
import seventh_art.rocky.repository.PerfilRepository;
import seventh_art.rocky.repository.PesoRepository;
import seventh_art.rocky.repository.UsuarioRepository;
import seventh_art.rocky.service.RachaService;

@Service
@RequiredArgsConstructor
public class PerfilActualService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PesoRepository pesoRepository;
    private final RachaService rachaService;

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
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails user) {
            email = user.getUsername();
        }
        // -----------------------------------------
        // 2. LOGIN GOOGLE OIDC
        // -----------------------------------------
        else if (principal instanceof org.springframework.security.oauth2.core.oidc.user.OidcUser oidcUser) {
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

    // ------------------------------------------------------
    // Metodos para manejar la racha actual de entrenamientos
    // ------------------------------------------------------

    public void actualizarRachaActual() {
        Perfil perfil = getCurrentPerfil();
        //llamo a metodo que me retorna la cantidad de dias entrenados en la semana actual
        int diasEntrenadosEnLaSemana = rachaService.contarDiasEntrenadosPorSemana(perfil, getFechaInicioSemana(), getFechaFinSemana());
        perfil.setRachaActual(diasEntrenadosEnLaSemana);
        perfilRepository.save(perfil);
    }

    public void resetearRachaActual() {
        Perfil perfil = getCurrentPerfil();
        perfil.setRachaActual(0);
        perfilRepository.save(perfil);
    }

    public RachaDTO getRachaDTO() {
        Perfil perfil = getCurrentPerfil();
        int rachaActual = perfil.getRachaActual();
        int rachaDeseada = perfil.getRachaDeseada();
        boolean completada = false;
        if (rachaActual >= rachaDeseada) {
            completada = true;
        }
        return new RachaDTO(rachaActual, rachaDeseada, completada);
    }

    // -----------------------------------------------
    // Métodos para obtener fechas de la semana actual
    // -----------------------------------------------
    public LocalDate getFechaActual() {
        return LocalDate.now();
    }

    public LocalDate getFechaInicioSemana() {
        LocalDate hoy = getFechaActual();
        return hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }

    public LocalDate getFechaFinSemana() {
        LocalDate hoy = getFechaActual();
        return hoy.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
    }

    public Objetivo getObjetivoPerfil() {
        Perfil perfil = getCurrentPerfil();
        return perfil.getObjetivo();
    }
}
