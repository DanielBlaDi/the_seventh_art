package seventh_art.rocky.dto.achievement;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LogroUsuarioDTO {

    private Long logroId;

    @Min(value = 0, message = "El progreso no puede ser negativo.")
    private Integer progreso;

    private LocalDateTime otorgadoEn;

    private String meta; // opcional, JSON/contexto
}
