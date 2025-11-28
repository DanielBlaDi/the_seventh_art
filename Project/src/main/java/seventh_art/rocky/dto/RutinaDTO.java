package seventh_art.rocky.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RutinaDTO {

    @NotBlank
    private String nombre;

    @NotBlank
    private String descripcion;

    @NotEmpty
    private List<EjercicioIdDTO> ejercicios;

    @Getter @Setter
    public static class EjercicioIdDTO {
        private Long id;
    }
}
