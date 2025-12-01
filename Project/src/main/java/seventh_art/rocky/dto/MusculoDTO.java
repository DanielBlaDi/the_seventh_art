package seventh_art.rocky.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MusculoDTO {

    private String nombreMusculo;
    private int porcentaje; // 0–100
}
