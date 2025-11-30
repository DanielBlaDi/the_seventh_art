package seventh_art.rocky.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
@Getter
@Slf4j
public class MensajeService {

    private final List<String> mensajes;
    private static final List<String> emoji = List.of("💪", "🔥", "🏋️",
            "🦵", "🔥", "🏃",
            "🦾", "🧱", "🏋️‍♂️",
            "❤️", "🏃‍♂️", "🔥",
            "🏅", "🧘", "🫀");
    private final Random random = new Random();

    public MensajeService(ObjectMapper objectMapper,
                          ResourceLoader resourceLoader) throws IOException {

        Resource resource = resourceLoader.getResource("classpath:data/mensajes_motivacionales.json");

        List<String> lista;
        try(InputStream inputStream = resource.getInputStream()) {
            lista = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<String>>() {}
            );
        } catch (IOException e){
            log.error("Error leyendo mensajes motivacionales", e);
            throw e;
        }

        this.mensajes = Collections.unmodifiableList(lista);
        log.info("Se cargaron {} mensajes motivacionales", mensajes.size());
    }

    private String getEmoji(){

        int index = random.nextInt(emoji.size());

        return emoji.get(index);
    }

    public String getMensaje(){

        if (mensajes == null || mensajes.isEmpty()){
            return "Un paso a la vez, un asalto a la vez. " + getEmoji();
        }

        int index = random.nextInt(mensajes.size());
        return mensajes.get(index) + " " +  getEmoji();
    }

}
