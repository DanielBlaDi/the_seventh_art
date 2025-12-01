-- 1) Días de actividad: 10
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    '10 días activos',
    'Entrenaste 10 días distintos.',
    'days_active_10',
    'COUNT',
    10,
    NULL
);

-- 2) Días de actividad: 30
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    '30 días activos',
    'Entrenaste 30 días distintos.',
    'days_active_30',
    'COUNT',
    30,
    NULL
);

-- 3) Racha objetivo alcanzada (usar perfil.racha_actual vs racha_deseada)
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Lo prometido es deuda',
    'Has alcanzado la racha que te propusiste.',
    'streak_target_reached',
    'STREAK',
    NULL,
    NULL
);

-- 4) Primer ejercicio de una categoría (genérico; params puede indicar categoría)
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Primeros pasos',
    'Has realizado una rutina por primera vez.',
    'first_routine_finish',
    'FLAG',
    NULL,
    '{"categoria":"any"}'
);

-- -- 5) Completar 10 ejercicios de una categoría (ejemplo: piernas)
-- INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
-- VALUES (
--     '10 ejercicios de piernas',
--     'Completaste 10 ejercicios distintos de la categoría piernas.',
--     'category_piernas_10',
--     'COUNT',
--     10,
--     '{"categoria":"piernas"}'
-- );


-- 6) Consistencia en 7 días (rolling window): 3 sesiones
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Consistencia 3 en 7!',
    'Completaste al menos 3 entrenamientos en los últimos 7 días.',
    'weekly_consistency_3',
    'COUNT',
    3,
    '{"ventanaDias":7}'
);

-- 7) Explorador: 20 ejercicios distintos
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Explorador',
    'Has probado 20 ejercicios distintos.',
    'distinct_exercises_20',
    'DISTINCT',
    20,
    NULL
);

-- 8) Returner: vuelves después de 14 días sin actividad
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'El regreso del rey',
    'Volviste a entrenar luego de 14 días o más sin actividad.',
    'return_after_14',
    'FLAG',
    NULL,
    '{"dias":14}'
);
