package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Peso;

import java.util.List;
import java.util.Optional;

public interface PesoRepository extends JpaRepository<Peso, Long> {

    // Devuelve el último registro de peso para un perfil
    Optional<Peso> findFirstByPerfilIdOrderByFechaDesc(Long perfilId);

    List<Peso> findByPerfilOrderByFechaAsc(Perfil perfil);

    List<Peso> findTop5ByPerfilOrderByFechaDesc(Perfil perfil);

    Optional<Peso> findTopByPerfilOrderByFechaDesc(Perfil perfil);

    List<Peso> findTop2ByPerfilOrderByFechaDesc(Perfil perfil);

    Long countByPerfil(Perfil perfil);
}
