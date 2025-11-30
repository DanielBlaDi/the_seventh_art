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
    'Racha objetivo alcanzada',
    'Has alcanzado la racha que te propusiste.',
    'streak_target_reached',
    'STREAK',
    NULL,
    NULL
);

-- 4) Primer ejercicio de una categoría (genérico; params puede indicar categoría)
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Primer ejercicio de categoría',
    'Completaste por primera vez un ejercicio de una categoría.',
    'first_category',
    'FLAG',
    NULL,
    '{"categoria":"any"}'
);

-- 5) Completar 10 ejercicios de una categoría (ejemplo: piernas)
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    '10 ejercicios de piernas',
    'Completaste 10 ejercicios de la categoría piernas.',
    'category_piernas_10',
    'COUNT',
    10,
    '{"categoria":"piernas"}'
);

-- 6) Completar una rutina completa una vez
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Rutina completada (1 vez)',
    'Completaste todos los ejercicios de una rutina una vez.',
    'routine_complete_once',
    'FLAG',
    NULL,
    NULL
);

-- 7) Consistencia en 7 días (rolling window): 3 sesiones
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Consistencia 3 en 7 días',
    'Completaste al menos 3 sesiones en los últimos 7 días.',
    'weekly_consistency_3',
    'COUNT',
    3,
    '{"ventanaDias":7}'
);

-- 8) Explorador: 20 ejercicios distintos
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Explorador - 20 ejercicios',
    'Has probado 20 ejercicios distintos.',
    'distinct_exercises_20',
    'DISTINCT',
    20,
    NULL
);

-- 9) Returner: vuelves después de 14 días sin actividad
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Regresaste después de un descanso',
    'Volviste a entrenar luego de 14 días o más sin actividad.',
    'return_after_14',
    'FLAG',
    NULL,
    '{"dias":14}'
);

-- 10) Combo diario: 3 categorías distintas en un día
INSERT INTO logro (nombre, descripcion, clave, tipo, umbral, params)
VALUES (
    'Combo diario - 3 categorías',
    'En un día completaste ejercicios de 3 categorías distintas.',
    'daily_combo_3',
    'COUNT',
    3,
    '{"tipo":"categorias_por_dia"}'
);
