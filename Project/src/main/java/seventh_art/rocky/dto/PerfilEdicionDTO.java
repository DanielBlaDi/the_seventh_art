package seventh_art.rocky.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import seventh_art.rocky.entity.Objetivo;

@Getter
@Setter
public class PerfilEdicionDTO {

    @NotBlank(message = "El nombre no puede estar vacío.")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres.")
    @Pattern(
        regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\\s]+$",
        message = "El nombre solo puede contener letras y espacios."
    )
    private String nombre;

    @NotBlank(message = "El apellido no puede estar vacío.")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres.")
    @Pattern(
            regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\\s]+$",
            message = "El apellido solo puede contener letras y espacios."
    )
    private String apellido;

    @Min(value = 14, message = "La edad mínima es 14 años.")
    @Max(value = 120, message = "La edad máxima es 120 años.")
    private Integer edad;

    @NotNull(message = "La estatura no puede estar vacía.")
    @DecimalMin(value = "1.0", inclusive = true, message = "La estatura mínima es 1 m.")
    @DecimalMax(value = "2.5", inclusive = true, message = "La estatura máxima es 2.5 m.")
    @Digits(integer = 1, fraction = 2, message = "La estatura debe tener formato como 1.70")
    private Float estatura;  // m

        private Objetivo objetivo;   // SUBIR, BAJAR, MANTENER
    private Integer rachaDeseada; // usaremos esto como "días de entrenamiento por semana"
}
