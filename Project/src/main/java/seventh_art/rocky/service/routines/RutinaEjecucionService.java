package seventh_art.rocky.service.routines;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import seventh_art.rocky.dto.RutinaFinalizadaDTO;
import seventh_art.rocky.dto.SetEjercicioDTO;
import seventh_art.rocky.entity.*;
import seventh_art.rocky.repository.EjercicioRepository;
import seventh_art.rocky.repository.HistoriaRepository;
import seventh_art.rocky.repository.RutinaRepository;
import seventh_art.rocky.repository.SetEjercicioRepository;
import seventh_art.rocky.service.PerfilActualService;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RutinaEjecucionService {

    private final PerfilActualService perfilActualService;
    private final RutinaRepository rutinaRepository;
    private final EjercicioRepository ejercicioRepository;
    private final SetEjercicioRepository setEjercicioRepository;
    private final HistoriaRepository historiaRepository;

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
