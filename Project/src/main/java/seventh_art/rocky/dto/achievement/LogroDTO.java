package seventh_art.rocky.dto.achievement;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogroDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private String clave;
    private String tipo;     // COUNT, FLAG, STREAK, DISTINCT
    private Integer umbral;  // puede ser null
    private String params;   // JSON opcional
}
