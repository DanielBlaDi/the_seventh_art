package seventh_art.rocky.service.routines;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.TipoEjercicio;
import seventh_art.rocky.repository.EjercicioRepository;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EjercicioService {

    private final EjercicioRepository ejercicioRepository;

    public EjercicioService(EjercicioRepository ejercicioRepository) {
        this.ejercicioRepository = ejercicioRepository;
    }

    public List<Ejercicio> listarTodos() {
        return ejercicioRepository.findAll();
    }

    public List<Ejercicio> listarPorTipo(TipoEjercicio tipo) {
        return ejercicioRepository.findByTipoEjercicio(tipo);
    }

    public List<Ejercicio> buscarPorNombre(String nombre) {
        return ejercicioRepository.findByNombreContainingIgnoreCase(nombre);
    }
}
