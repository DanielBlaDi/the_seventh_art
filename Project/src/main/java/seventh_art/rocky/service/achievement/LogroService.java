package seventh_art.rocky.service.achievement;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import seventh_art.rocky.dto.achievement.LogroConProgresoDTO;
import seventh_art.rocky.dto.achievement.LogroDTO;
import seventh_art.rocky.dto.achievement.LogroUsuarioDTO;
import seventh_art.rocky.entity.Historia;
import seventh_art.rocky.entity.Logro;
import seventh_art.rocky.entity.LogroUsuario;
import seventh_art.rocky.repository.HistoriaRepository;
import seventh_art.rocky.repository.LogroRepository;
import seventh_art.rocky.repository.LogroUsuarioRepository;
import seventh_art.rocky.repository.SetEjercicioRepository;

@Service
@RequiredArgsConstructor
public class LogroService {

    private final LogroRepository logroRepository;
    private final LogroUsuarioRepository logroUsuarioRepository;
    private final LogroUsuarioService logroUsuarioService;
    private final HistoriaRepository historiaRepository;
    private final SetEjercicioRepository setEjercicioRepository;

    // =========================
    // 1) CONSULTAR PROGRESO
    // =========================
    /**
     * Devuelve TODOS los logros del catalogo junto con el progreso
     * del perfil. Si no existe fila en logro_usuario, se asume progreso 0.
     */
    @Transactional(readOnly = true)
    public List<LogroConProgresoDTO> getLogrosConProgreso(Long perfilId) {

        // 1) catalogo completo de logros
        List<Logro> catalogo = logroRepository.findAll();

        // 2) estadoLogros existentes para el perfil
        List<LogroUsuario> estadoLogros = logroUsuarioRepository.findAllByPerfilId(perfilId);

        // 3) mapear por id de logro
        Map<Long, LogroUsuario> estadoPorLogroId = estadoLogros.stream()
                .collect(Collectors.toMap(
                        logroUsuario -> logroUsuario.getLogro().getId(),
                        logroUsuario -> logroUsuario
                ));

        // 4) construir DTO para cada logro del catalogo
        return catalogo.stream()
                .map(logro -> {
                    LogroUsuario logroUsuario = estadoPorLogroId.get(logro.getId());
                    if (logroUsuario == null) {
                        // Crear un estado temporal para mostrar avance 0 en vista
                        logroUsuario = new LogroUsuario();
                        logroUsuario.setLogro(logro);
                        logroUsuario.setProgreso(0);
                        logroUsuario.setOtorgadoEn(null);
                        logroUsuario.setMeta(null);
                    }
                    return mapearALogroConProgresoDTO(logroUsuario);
                })
                .toList();
    }

    private LogroConProgresoDTO mapearALogroConProgresoDTO(LogroUsuario logroUsuario) {

        Logro logro = logroUsuario.getLogro();
        Integer umbral = logro.getUmbral();
        int progreso = 0;
        if (logroUsuario.getProgreso() != null) {
            progreso = logroUsuario.getProgreso();
        }

        boolean completado;
        int porcentaje;
        // Si no tiene conteo no tiene umbral ni progreso numérico
        Integer faltante = null;

        if (umbral != null && umbral > 0) {
            completado = (progreso >= umbral); // Retorna booleano
            int falta = (umbral - progreso);
            faltante = Math.max(falta, 0);  // 0 si ya completó
            porcentaje = (int) Math.min(100,Math.round(
                (progreso * 100.0) / umbral) // 100 si ya completó
            );
        } else {
            // FLAG u otros sin umbral numérico
            completado = logroUsuario.getOtorgadoEn() != null;
            if (completado) {
                porcentaje = 100;
            } else {
                porcentaje = 0;
            }
        }

        // Tanto pinchi DTO es para mostrar en frontend  XD

        // ---- armar LogroDto ----
        LogroDTO logroDto = new LogroDTO();
        logroDto.setId(logro.getId());
        logroDto.setNombre(logro.getNombre());
        logroDto.setDescripcion(logro.getDescripcion());
        logroDto.setClave(logro.getClave());
        logroDto.setTipo(logro.getTipo());
        logroDto.setUmbral(logro.getUmbral());
        logroDto.setParams(logro.getParams());

        // ---- armar LogroUsuarioDto ----
        LogroUsuarioDTO estadoDto = new LogroUsuarioDTO();
        estadoDto.setLogroId(logro.getId());
        estadoDto.setProgreso(progreso);
        estadoDto.setOtorgadoEn(logroUsuario.getOtorgadoEn());
        estadoDto.setMeta(logroUsuario.getMeta());

        // ---- armar LogroConProgresoDto ----
        LogroConProgresoDTO dto = new LogroConProgresoDTO();
        dto.setLogro(logroDto);
        dto.setEstado(estadoDto);
        dto.setFaltante(faltante);
        dto.setPorcentaje(porcentaje);
        dto.setCompletado(completado);

        return dto;
    }

    // ====================================
    // 2) EVALUAR CUANDO SE CREA HISTORIA
    // ====================================
    /**
     * Invocar este método justo después de persistir la Historia.
     */
    @Transactional
    public void verificarYOtorgarPorEntradaDeHistoria(Historia historia) {

        Long perfilId = historia.getRutina().getPerfil().getId();

        // Por ahora: obtener todos los logros del catalogo
        List<Logro> logros = logroRepository.findAll();

        for (Logro logro : logros) {
            evaluarYActualizar(perfilId, logro, historia);
        }
    }

    private void evaluarYActualizar(Long perfilId, Logro logro, Historia historia) {

        String tipo = logro.getTipo();

        switch (tipo) {
            case "COUNT" -> {
                int valor = calcularCountPara(perfilId, logro);
                logroUsuarioService.upsertProgreso(perfilId, logro.getId(), valor);
            }
            case "DISTINCT" -> {
                int valor = calcularDistinctPara(perfilId, logro);
                logroUsuarioService.upsertProgreso(perfilId, logro.getId(), valor);
            }
            case "STREAK" -> {
                // mejor usar la fecha de la historia que LocalDate.now()
                boolean reached = checkStreak(perfilId, logro, historia.getFecha());
                if (reached) {
                    logroUsuarioService.award(perfilId, logro.getId(), null);
                }
            }
            case "FLAG" -> {
                boolean flag = checkFlagCondition(perfilId, logro, historia);
                if (flag) {
                    logroUsuarioService.award(perfilId, logro.getId(), null);
                }
            }
            default -> {
                // opcional: se haria sobre tipo desconocido
            }
        }
    }

    // ================================
    // 3) IMPLEMENTACIÓN DE LA LÓGICA
    // ================================

    /**
     * Helper para extraer el número de la clave, ej: "days_active_10" -> 10.
     */
    private int extraerNumeroDesdeClave(String clave, String prefijo) {
        if (clave == null || !clave.startsWith(prefijo + "_")) return 0;
        String numStr = clave.substring((prefijo + "_").length());
        try {
            return Integer.parseInt(numStr);
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    /**
     * COUNT: ejemplo de logros tipo "days_active_10", "days_active_30"...
     * Cuenta días activos distintos en la ventana de N días cargando historias
     * y haciendo el DISTINCT en memoria.
     */
    private int calcularCountPara(Long perfilId, Logro logro) {
        String clave = logro.getClave();
        if (clave == null) return 0;

        if (clave.startsWith("days_active_")) {
            int numeroDia = extraerNumeroDesdeClave(clave, "days_active");

            LocalDate hoy = LocalDate.now();
            LocalDate desde;
            if (numeroDia > 0) {
                desde = hoy.minusDays(numeroDia - 1L); // 1L para que sea long, que es lo que recibe minusDays
            } else {
                // si no hay N, todo el histórico
                desde = LocalDate.MIN;
            }

            List<Historia> historias = historiaRepository
                    .findByRutina_Perfil_IdAndFechaGreaterThanEqual(perfilId, desde);

            // cuenta cuantas dias distintos entreno en los ultimos N dias
            long diasDistintos = historias.stream()
                    .map(Historia::getFecha)
                    .distinct()
                    .count();

            return (int) diasDistintos;
        }

        // Aquí se puede añadir otros tipos de COUNT en el futuro (weekly_consistency_3, etc.)

        return 0;
    }

    /**
     * DISTINCT: ejemplo "distinct_exercises_20".
     * Cuenta ejercicios distintos que el perfil ha realizado (tabla sets) en memoria.
     */
    private int calcularDistinctPara(Long perfilId, Logro logro) {
        String clave = logro.getClave();
        if (clave == null) return 0;

        if (clave.startsWith("distinct_exercises_")) {
            var sets = setEjercicioRepository.findByPerfil_Id(perfilId);

            long ejerciciosDistintos = sets.stream()
                    .map(se -> se.getEjercicio().getId())
                    .distinct()
                    .count();

            return (int) ejerciciosDistintos;
        }

        return 0;
    }

    /**
     * STREAK: racha diaria de entrenamientos.
     * Usa el umbral del logro como número de días consecutivos requeridos,
     * tomando como base la fecha de la Historia recién creada.
     */
    private boolean checkStreak(Long perfilId, Logro logro, LocalDate fechaBase) {
        Integer umbral = logro.getUmbral();
        if (umbral == null || umbral <= 0) return false;

        List<Historia> historias = historiaRepository
                .findByRutina_Perfil_IdOrderByFechaDesc(perfilId);

        if (historias.isEmpty()) return false;

        // Fechas distintas, ordenadas de más nueva a más vieja
        List<LocalDate> fechas = historias.stream()
                .map(Historia::getFecha)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .toList();

        int streak = 0;
        LocalDate fechaEsperada = fechaBase;

        // Comienza la fecha base desde hpy
        // f recorre las fechas de historias
        // ambas disminuyen de 1 en 1, si se desfasan es porq se rompio la racha

        for (LocalDate f : fechas) {
            if (f.isEqual(fechaEsperada)) {
                streak++;
                fechaEsperada = fechaEsperada.minusDays(1);
                if (streak >= umbral) {
                    return true;
                }
            } else if (f.isBefore(fechaEsperada)) {
                // se rompió la racha
                break;
            } else {
                // f.isAfter(fechaEsperada): día futuro o inconsistente, se ignora
            }
        }

        return false;
    }

    /**
     * FLAG: condiciones tipo "return_after_14", "first_xxx", etc.
     * De momento implementamos return_after_14 usando lógica en memoria.
     */
    private boolean checkFlagCondition(Long perfilId, Logro logro, Historia nuevaHistoria) {
        String clave = logro.getClave();
        if (clave == null) return false;

        // Ejemplo directo: "return_after_14"
        if ("return_after_14".equals(clave)) {
            LocalDate fechaNueva = nuevaHistoria.getFecha();

            // Todas las historias del perfil, más nuevas primero
            List<Historia> historias = historiaRepository
                    .findByRutina_Perfil_IdOrderByFechaDesc(perfilId);

            // Última fecha antes de la nueva
            var ultimaAntes = historias.stream()
                    .map(Historia::getFecha)
                    .filter(f -> f.isBefore(fechaNueva))
                    .max(LocalDate::compareTo);

            if (ultimaAntes.isEmpty()) {
                // Nunca había entrenado antes: no es "return"
                return false;
            }

            long diff = ChronoUnit.DAYS.between(ultimaAntes.get(), fechaNueva);
            return diff >= 14;
        }

        // Aquí puedes añadir más flags en el futuro:
        // - first_category_xxx
        // - category_xxx
        // usando historias/sets según cómo modeles categorías.

        return false;
    }
}
