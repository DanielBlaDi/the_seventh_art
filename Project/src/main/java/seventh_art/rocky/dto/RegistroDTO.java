package seventh_art.rocky.dto;

import lombok.Getter;
import lombok.Setter;
import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Sexo;

@Getter
@Setter
public class RegistroDTO {

    // Paso 2 (Perfil)
    private String nombre;
    private String apellido;
    private Integer edad;
    private Sexo sexo;
    private Float peso;     // kg
    private Float estatura; // m (como en tu formulario)

    // Paso 3 (Perfil)
    private Objetivo objetivo;   // SUBIR, BAJAR, MANTENER
    private Integer rachaDeseada; // usaremos esto como "días de entrenamiento por semana"
}
