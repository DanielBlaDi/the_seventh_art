-- =========================================
-- USUARIO
-- =========================================
CREATE TABLE IF NOT EXISTS usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    email VARCHAR(120) NOT NULL,
    password VARCHAR(120) NOT NULL,
    creado_en DATETIME NOT NULL,
    CONSTRAINT pk_usuario PRIMARY KEY (id),
    CONSTRAINT uk_usuario_email UNIQUE (email)
);

-- =========================================
-- PERFIL
-- =========================================
CREATE TABLE IF NOT EXISTS perfil (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    edad INT NOT NULL,
    sexo VARCHAR(10) NOT NULL,          -- Enum Sexo (MASCULINO, FEMENINO)
    objetivo VARCHAR(30) NOT NULL,      -- Enum Objetivo
    racha_deseada INT NOT NULL,
    racha_actual INT NOT NULL,
    estatura FLOAT NOT NULL,
    imc FLOAT NOT NULL,
    id_usuario BIGINT NOT NULL UNIQUE,
    CONSTRAINT pk_perfil PRIMARY KEY (id),
    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

-- =========================================
-- EJERCICIO
-- =========================================
CREATE TABLE IF NOT EXISTS ejercicio (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(1000) NOT NULL,
    imagen_url VARCHAR(200) UNIQUE,
    tipo_ejercicio VARCHAR(50) NOT NULL,   -- Enum TipoEjercicio
    CONSTRAINT pk_ejercicio PRIMARY KEY (id)
);

-- =========================================
-- RUTINA
-- =========================================
CREATE TABLE IF NOT EXISTS rutina (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_rutina PRIMARY KEY (id),
    CONSTRAINT fk_rutina_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);

-- =========================================
-- HISTORIA
-- =========================================
CREATE TABLE IF NOT EXISTS historia (
    id BIGINT NOT NULL AUTO_INCREMENT,
    tiempo BIGINT NOT NULL,
    fecha DATE NOT NULL,
    id_rutina BIGINT NOT NULL,
    CONSTRAINT pk_historia PRIMARY KEY (id),
    CONSTRAINT fk_historia_rutina
        FOREIGN KEY (id_rutina) REFERENCES rutina(id)
);

-- =========================================
-- LOGRO
-- =========================================
CREATE TABLE IF NOT EXISTS logro (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_logro PRIMARY KEY (id),
    CONSTRAINT fk_logro_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);

-- =========================================
-- MENSAJE MOTIVACIONAL
-- =========================================
CREATE TABLE IF NOT EXISTS mensaje_motivacional (
    id BIGINT NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL,
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_mensaje_motivacional PRIMARY KEY (id),
    CONSTRAINT fk_mensaje_motivacional_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);

-- =========================================
-- PESO
-- =========================================
CREATE TABLE IF NOT EXISTS peso (
    id BIGINT NOT NULL AUTO_INCREMENT,
    valor FLOAT NOT NULL,
    fecha DATETIME NOT NULL,
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_peso PRIMARY KEY (id),
    CONSTRAINT fk_peso_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);

-- =========================================
-- SET (tabla: sets)
-- =========================================
CREATE TABLE IF NOT EXISTS sets (
    id BIGINT NOT NULL AUTO_INCREMENT,
    peso FLOAT NOT NULL,
    repeticiones INT NOT NULL,
    id_ejercicio BIGINT NOT NULL,
    CONSTRAINT pk_sets PRIMARY KEY (id),
    CONSTRAINT fk_set_ejercicio
        FOREIGN KEY (id_ejercicio) REFERENCES ejercicio(id)
);
