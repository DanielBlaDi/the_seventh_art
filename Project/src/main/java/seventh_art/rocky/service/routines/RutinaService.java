package seventh_art.rocky.service.routines;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.RutinaDTO;
import seventh_art.rocky.dto.RutinaDetalleDTO;
import seventh_art.rocky.dto.RutinaVistaDTO;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;
import seventh_art.rocky.repository.EjercicioRepository;
import seventh_art.rocky.repository.HistoriaRepository;
import seventh_art.rocky.repository.RutinaRepository;
import seventh_art.rocky.service.PerfilActualService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RutinaService {

    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final PerfilActualService perfilActualService;
    private final HistoriaRepository historiaRepository;

    @Transactional
    public Rutina crear(RutinaDTO dto) {

        Perfil perfil = perfilActualService.getCurrentPerfil();

        if (dto.getEjercicios() == null || dto.getEjercicios().isEmpty()) {
            throw new IllegalArgumentException("La rutina debe tener al menos un ejercicio.");
        }

        List<Ejercicio> ejercicios = dto.getEjercicios().stream()
                .map(e -> ejercicioRepository.findById(e.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException("Ejercicio no encontrado: " + e.getId())
                        ))
                .collect(Collectors.toList());

        Rutina rutina = Rutina.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .perfil(perfil)
                .ejercicios(ejercicios)
                .estado(1)
                .build();


        return rutinaRepository.save(rutina);
    }

    public List<RutinaVistaDTO> listarRutinasPerfilActual() {
        Perfil perfil = perfilActualService.getCurrentPerfil();

        List<Rutina> rutinas = rutinaRepository.findByPerfilAndEstadoTrueOrderByIdDesc(perfil);

        return rutinas.stream()
                .map(r -> new RutinaVistaDTO(
                        r.getId(),
                        r.getNombre(),
                        r.getDescripcion(),
                        r.getEjercicios() != null ? r.getEjercicios().size() : 0
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminar(Long rutinaId) {
        Perfil perfilActual = perfilActualService.getCurrentPerfil();

        Rutina rutina = rutinaRepository.findById(rutinaId)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada: " + rutinaId));

        if (!rutina.getPerfil().getId().equals(perfilActual.getId())) {
            throw new SecurityException("No tienes permiso para eliminar esta rutina.");
        }

        boolean tieneHistoria = historiaRepository.existsByRutina(rutina);

        if(tieneHistoria){

            rutina.setEstado(0);
            rutinaRepository.save(rutina);

        }else{

            rutinaRepository.delete(rutina);

        }
    }

    public RutinaDetalleDTO obtenerRutinaConDetalles(Long rutinaId) {

        Perfil perfil = perfilActualService.getCurrentPerfil();

        Rutina rutina = rutinaRepository.findById(rutinaId)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada: " + rutinaId));

        if (!rutina.getPerfil().getId().equals(perfil.getId())) {
            throw new SecurityException("No tienes permiso para ver esta rutina.");
        }

        List<RutinaDetalleDTO.EjercicioEnRutina> ejerciciosEnRutina =
                rutina.getEjercicios().stream()
                        .map(e -> new RutinaDetalleDTO.EjercicioEnRutina(
                                e.getId(),
                                e.getNombre(),
                                e.getTipoEjercicio().name(),
                                e.getImagenUrl()
                        ))
                        .collect(Collectors.toList());

        return new RutinaDetalleDTO(
                rutina.getId(),
                rutina.getNombre(),
                rutina.getDescripcion(),
                ejerciciosEnRutina
        );
    }

    @Transactional
    public void actualizarRutina(Long rutinaId, RutinaDTO dto) {

        Perfil perfilActual = perfilActualService.getCurrentPerfil();

        Rutina rutina = rutinaRepository.findById(rutinaId)
                .orElseThrow(() -> new IllegalArgumentException("Rutina no encontrada: " + rutinaId));

        if (!rutina.getPerfil().getId().equals(perfilActual.getId())) {
            throw new SecurityException("No tienes permiso para actualizar esta rutina.");
        }

        rutina.setNombre(dto.getNombre());

        rutina.setDescripcion(dto.getDescripcion());

        if (dto.getEjercicios() == null || dto.getEjercicios().isEmpty()) {
            throw new IllegalArgumentException("La rutina debe tener al menos un ejercicio.");
        }

        List<Ejercicio> ejercicios = dto.getEjercicios().stream()
                .map(e -> ejercicioRepository.findById(e.getId())
                        .orElseThrow(() ->
                                new IllegalArgumentException("Ejercicio no encontrado: " + e.getId())
                        ))
                .collect(Collectors.toList());

        rutina.setEjercicios(ejercicios);

        rutinaRepository.save(rutina);
    }
}

