package seventh_art.rocky.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RutinaFinalizadaDTO {

    private Long id;
    private Long tiempo;
    private List<SetEjercicioDTO> sets;
}
