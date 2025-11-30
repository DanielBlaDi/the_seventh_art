package seventh_art.rocky.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import seventh_art.rocky.entity.Logro;

public interface LogroRepository extends JpaRepository<Logro, Long> {

    Optional<Logro> findByClave(String clave);

    boolean existsByClave(String clave);
}
