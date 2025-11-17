package seventh_art.rocky.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Sexo;

@Getter
@Setter
public class RegistroDTO {

    // Paso 2 (Perfil)

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

    @NotNull(message = "El sexo no puede estar vacío.")
    private Sexo sexo;

    @NotNull(message = "El peso no puede estar vacío.")
    @DecimalMin(value = "10.0", message = "El peso mínimo es 10 kg.")
    @DecimalMax(value = "350.0", message = "El peso máximo es 350 kg.")
    @Digits(integer = 3, fraction = 2, message = "El peso debe ser un número válido con hasta 2 decimales.")
    private Float peso;     // kg

    @NotNull(message = "La estatura no puede estar vacía.")
    @DecimalMin(value = "1.0", inclusive = true, message = "La estatura mínima es 1 m.")
    @DecimalMax(value = "2.5", inclusive = true, message = "La estatura máxima es 2.5 m.")
    @Digits(integer = 1, fraction = 2, message = "La estatura debe tener formato como 1.70")
    private Float estatura;  // m

    // Paso 3 (Perfil)
    private Objetivo objetivo;   // SUBIR, BAJAR, MANTENER
    private Integer rachaDeseada; // usaremos esto como "días de entrenamiento por semana"
}
