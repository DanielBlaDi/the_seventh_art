package seventh_art.rocky.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class StatsDTO {
    private LocalDate fecha;
    private List<String> labels;
    private List<Integer> values;
    private List<MusculoDTO> musculos;
    private String ejercicioMasTrabajado;
    private int totalSetsdeEjercicioMasTrabajado;
    private String totalTiempoEntrenamiento;  //Cambiar al tipo que corresponda
}
