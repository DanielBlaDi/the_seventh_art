package seventh_art.rocky.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import seventh_art.rocky.entity.LogroUsuario;

public interface LogroUsuarioRepository extends JpaRepository<LogroUsuario, Long> {

    // Progreso de un logro de perfil por ID
    Optional<LogroUsuario> findByPerfilIdAndLogroId(Long perfilId, Long logroId);

    // Por clave del logro
    Optional<LogroUsuario> findByPerfilIdAndLogroClave(Long perfilId, String clave);

    // Los logros con progreso de un perfil
    List<LogroUsuario> findAllByPerfilId(Long perfilId);

    // Para saber si ya se gano el logro
    boolean existsByPerfilIdAndLogroClave(Long perfilId, String clave);
}
