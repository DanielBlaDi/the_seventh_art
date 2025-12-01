package seventh_art.rocky.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class PesoRegistroDTO {

    @NotNull(message = "El peso es obligatorio")
    @DecimalMin(value = "10.0", message = "El peso mínimo permitido es 10 kg")
    @DecimalMax(value = "300.0", message = "El peso máximo permitido es 300 kg")
    private Float peso;

    @NotNull(message = "La fecha es obligatoria")
    @PastOrPresent(message = "La fecha no puede ser futura")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fecha;

}
