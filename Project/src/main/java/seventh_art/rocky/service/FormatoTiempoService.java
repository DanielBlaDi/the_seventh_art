package seventh_art.rocky.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class FormatoTiempoService {

    public static Long tiempoEnHoras(Long time){
        return time/3600;
    }
}
