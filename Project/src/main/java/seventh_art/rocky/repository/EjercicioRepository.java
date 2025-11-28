package seventh_art.rocky.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.TipoEjercicio;

import java.util.List;

public interface EjercicioRepository extends JpaRepository<Ejercicio, Long> {

    // Para futuro filtrado por tipo
    List<Ejercicio> findByTipoEjercicio(TipoEjercicio tipoEjercicio);

    // Para futuro buscador por nombre
    List<Ejercicio> findByNombreContainingIgnoreCase(String nombre);
}
