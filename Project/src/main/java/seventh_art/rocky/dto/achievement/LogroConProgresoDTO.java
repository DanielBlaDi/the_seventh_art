package seventh_art.rocky.dto.achievement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogroConProgresoDTO {

    private LogroDTO logro;            // datos del catálogo
    private LogroUsuarioDTO estado;    // puede ser null si nunca ha iniciado progreso

    private Integer faltante;          // puede ser null si no aplica
    private Integer porcentaje;        // 0–100
    private boolean completado;        // logrado sí/no
}
