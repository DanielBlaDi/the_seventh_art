package seventh_art.rocky.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SetEjercicioDTO {

    private Long ejercicioId;
    private Float peso;
    private Integer repeticiones;

}
