package seventh_art.rocky.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RutinaVistaDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private int numeroEjercicios;
}
