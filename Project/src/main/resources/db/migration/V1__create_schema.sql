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
    nombre VARCHAR(100) NOT NULL,  
    descripcion VARCHAR(500) NOT NULL,
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_rutina PRIMARY KEY (id),
    CONSTRAINT fk_rutina_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);

-- Tabla intermedia para la relación ManyToMany: RUTINA_EJERCICIO
CREATE TABLE IF NOT EXISTS rutina_ejercicio (
    id_rutina   BIGINT NOT NULL,
    id_ejercicio BIGINT NOT NULL,
    CONSTRAINT pk_rutina_ejercicio PRIMARY KEY (id_rutina, id_ejercicio),
    CONSTRAINT fk_rutina_ejercicio_rutina
        FOREIGN KEY (id_rutina) REFERENCES rutina(id),
    CONSTRAINT fk_rutina_ejercicio_ejercicio
        FOREIGN KEY (id_ejercicio) REFERENCES ejercicio(id)
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
-- LOGRO (catálogo/tabla con info de los logros)
-- =========================================
CREATE TABLE IF NOT EXISTS logro (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    clave VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    umbral INT NULL,
    params VARCHAR(1000) NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT pk_logro PRIMARY KEY (id),
    CONSTRAINT uk_logro_clave UNIQUE (clave)
);

-- =========================================
-- LOGRO_USUARIO (progreso del logro por perfil/la de rompimiento de logros con algo mas)
-- =========================================
CREATE TABLE IF NOT EXISTS logro_usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    id_perfil BIGINT NOT NULL,
    id_logro BIGINT NOT NULL,
    progreso INT NOT NULL DEFAULT 0,
    otorgado_en DATETIME NULL,
    meta VARCHAR(1000) NULL,
    
    CONSTRAINT pk_logro_usuario PRIMARY KEY (id),
    CONSTRAINT uk_logro_usuario_perfil_logro UNIQUE (id_perfil, id_logro),
    CONSTRAINT fk_logro_usuario_logro FOREIGN KEY (id_logro) REFERENCES logro(id),
    CONSTRAINT fk_logro_usuario_perfil FOREIGN KEY (id_perfil) REFERENCES perfil(id)
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
    id_perfil BIGINT NOT NULL,
    CONSTRAINT pk_sets PRIMARY KEY (id),
    CONSTRAINT fk_set_ejercicio
        FOREIGN KEY (id_ejercicio) REFERENCES ejercicio(id),
    CONSTRAINT fk_set_perfil
        FOREIGN KEY (id_perfil) REFERENCES perfil(id)
);
