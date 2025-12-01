package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.SetEjercicio;

import java.util.List;

public interface SetEjercicioRepository extends JpaRepository<SetEjercicio, Long> {

    // Todos los sets registrados para un perfil
    List<SetEjercicio> findByPerfil_Id(Long perfilId);
}
