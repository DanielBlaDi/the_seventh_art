package seventh_art.rocky.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RutinaDetalleDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private List<EjercicioEnRutina> ejercicios;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class EjercicioEnRutina {
        private Long id;
        private String nombre;
        private String tipoEjercicio;
        private String url;
    }
}
