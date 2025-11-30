package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Rutina;

public interface HistoriaRepository extends JpaRepository<Historia, Long> {

    boolean existsByRutina(Rutina rutina);

}
