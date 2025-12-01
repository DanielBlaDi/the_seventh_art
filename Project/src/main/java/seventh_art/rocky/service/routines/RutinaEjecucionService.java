package seventh_art.rocky.service.routines;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.RutinaFinalizadaDTO;
import seventh_art.rocky.dto.SetEjercicioDTO;
import seventh_art.rocky.entity.Ejercicio;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Perfil;
import seventh_art.rocky.entity.Rutina;
import seventh_art.rocky.entity.SetEjercicio;
import seventh_art.rocky.repository.EjercicioRepository;
import seventh_art.rocky.repository.HistoriaRepository;
import seventh_art.rocky.repository.RutinaRepository;
import seventh_art.rocky.repository.SetEjercicioRepository;
import seventh_art.rocky.service.profile.PerfilActualService;
import seventh_art.rocky.service.achievement.LogroService;


@Service
@RequiredArgsConstructor
public class RutinaEjecucionService {

    private final PerfilActualService perfilActualService;
    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final SetEjercicioRepository setEjercicioRepository;
    private final HistoriaRepository historiaRepository;
    private final LogroService logroService;

    @Transactional
    public void registrarEjecucion(RutinaFinalizadaDTO dto){

        if(dto == null || dto.getRutinaId() == null){
            throw new IllegalArgumentException("RutinaFinalizadaDTO invalido");
        }

        Perfil perfil = perfilActualService.getCurrentPerfil();

        Rutina rutina = rutinaRepository.findById(dto.getRutinaId())
                .orElseThrow(() -> new IllegalArgumentException("Rutina inexistente" + dto.getRutinaId()));

        Long tiempo = dto.getTiempo();

        if(tiempo == null || tiempo <= 0){
            throw new IllegalArgumentException("Tiempo invalido");
        }

        Historia historia = Historia.builder()
                .rutina(rutina)
                .tiempo(tiempo)
                .fecha(LocalDate.now())
                .build();

        historiaRepository.save(historia);
        logroService.verificarYOtorgarPorEntradaDeHistoria(historia);
        perfilActualService.actualizarRachaActual(); // Actualizo la racha al registrar una nueva ejecución

        if (dto.getSets() != null) {
            for(SetEjercicioDTO setDTO : dto.getSets()){

                if (setDTO.getEjercicioId() == null){
                    throw new IllegalArgumentException("SetEjercicioDTO invalido");
                }

                Ejercicio ejercicio = ejercicioRepository.findById(setDTO.getEjercicioId()).orElseThrow(() -> new IllegalArgumentException(
                        "Ejercicio no encontrado: " + setDTO.getEjercicioId()));

                Float peso = setDTO.getPeso();
                Integer repeticiones = setDTO.getRepeticiones();

                SetEjercicio setEjercicio = SetEjercicio.builder()
                        .ejercicio(ejercicio)
                        .peso(peso)
                        .repeticiones(repeticiones)
                        .perfil(perfil)
                        .build();

                setEjercicioRepository.save(setEjercicio);
            }
        }
    }
}
