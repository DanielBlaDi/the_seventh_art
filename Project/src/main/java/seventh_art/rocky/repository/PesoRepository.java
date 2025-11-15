package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Peso;

import java.util.List;

public interface PesoRepository extends JpaRepository<Peso, Long> {

}
