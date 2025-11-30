package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Peso;

import java.util.Optional;

public interface PesoRepository extends JpaRepository<Peso, Long> {

    // Devuelve el último registro de peso para un perfil
    Optional<Peso> findFirstByPerfilIdOrderByFechaDesc(Long perfilId);

}
