package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Historia;

public interface HistoriaRepository extends JpaRepository<Historia, Long> {
}
