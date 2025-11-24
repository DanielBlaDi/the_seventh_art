package seventh_art.rocky.service.routines;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.RutinaDTO;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;
import seventh_art.rocky.repository.EjercicioRepository;
import seventh_art.rocky.repository.RutinaRepository;
import seventh_art.rocky.service.PerfilActualService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final PerfilActualService perfilActualService;

    public Rutina crear(RutinaDTO dto) {

        Perfil perfil = perfilActualService.getCurrentPerfil();

        List<Ejercicio> ejercicios = dto.getEjercicios().stream()
                .map(e -> ejercicioRepository.findById(e.getId())
                        .orElseThrow(() -> new IllegalArgumentException("Ejercicio no encontrado: " + e.getId())))
                .toList();

        Rutina rutina = Rutina.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .perfil(perfil)
                .ejercicios(ejercicios)
                .build();

        return rutinaRepository.save(rutina);
    }
}
