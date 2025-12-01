package seventh_art.rocky.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class RutinaVistaDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private int numeroEjercicios;
    private List<EjercicioPreviewDTO> ejerciciosPreview;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class EjercicioPreviewDTO {
        private Long id;
        private String nombre;
    }
}