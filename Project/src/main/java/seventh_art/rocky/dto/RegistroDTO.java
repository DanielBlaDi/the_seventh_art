package seventh_art.rocky.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import seventh_art.rocky.entity.Objetivo;
import seventh_art.rocky.entity.Sexo;

// seventh_art.rocky.dto
public class RegistroDTO {

    @NotBlank @Email private String email;          // Usuario
    @NotBlank @Size(min = 8) private String password; // Usuario
    @NotBlank @Size(min = 8) private String password2; // Usuario


    // Paso 2 (Perfil)
    @NotBlank @Size(min = 3, max = 50) private String nombre; // Perfil
    @NotBlank @Size(min = 3, max = 50) private String apellido;
    private Integer edad;
    private Sexo sexo;
    private Float peso;     // kg
    private Float estatura;  // m

    // Paso 3 (Perfil)
    private Objetivo objetivo;   // o enum como texto
    private String rachaDeseada;  // o enum como texto

    public String getEmail() {return email; }

    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

    public String getPassword2() { return password2; }

    public void setPassword2(String password2) {this.password2 = password2; }

    public String getNombre() { return nombre; }

    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellido() { return apellido; }

    public void setApellido(String apellido) { this.apellido = apellido; }

    public Integer getEdad() { return edad; }

    public void setEdad(Integer edad) { this.edad = edad; }

    public Sexo getSexo() { return sexo; }

    public void setSexo(Sexo sexo) { this.sexo = sexo; }

    public Float getPeso() { return peso; }

    public void setPeso(Float peso) { this.peso = peso; }

    public Float getEstatura() { return estatura; }

    public void setEstatura(Float estatura) { this.estatura = estatura; }

    public Objetivo getObjetivo() { return objetivo; }

    public void setObjetivo(Objetivo objetivo) { this.objetivo = objetivo; }

    public String getRachaDeseada() { return rachaDeseada; }

    public void setRachaDeseada(String rachaDeseada) { this.rachaDeseada = rachaDeseada; }

}
