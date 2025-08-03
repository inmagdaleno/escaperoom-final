<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$response = ['success' => false, 'mensaje' => 'Error desconocido.', 'ranking' => []];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $conexion = $database->getConexion();

    // Ranking por puntuación
    $query_score = "SELECT COALESCE(NULLIF(u.nombre, ''), u.email) AS jugador, p.puntuacion_final AS valor
                    FROM partida p
                    JOIN usuarios u ON p.id_usuario = u.id
                    WHERE p.modo_juego = 'puntos' AND p.resultado = 1 AND p.puntuacion_final IS NOT NULL
                    ORDER BY p.puntuacion_final DESC, p.fecha_partida ASC
                    LIMIT 10";

    // Ranking por tiempo (ordenado por menor tiempo empleado = mejor)
    $query_time = "SELECT COALESCE(NULLIF(u.nombre, ''), u.email) AS jugador, p.tiempo_empleado AS valor
                   FROM partida p
                   JOIN usuarios u ON p.id_usuario = u.id
                   WHERE p.modo_juego = 'tiempo' AND p.resultado = 1 AND p.tiempo_empleado IS NOT NULL
                   ORDER BY p.tiempo_empleado ASC, p.fecha_partida ASC
                   LIMIT 10";

    $ranking = ['score' => [], 'time' => []];

    // Obtener ranking por puntuación
    $result_score = $conexion->query($query_score);
    if ($result_score) {
        while ($row = $result_score->fetch_assoc()) {
            $ranking['score'][] = $row;
        }
    } else {
        $response['mensaje'] = 'Error al obtener ranking por puntuación: ' . $conexion->error;
        echo json_encode($response);
        $database->close();
        exit();
    }

    // Obtener ranking por tiempo
    $result_time = $conexion->query($query_time);
    if ($result_time) {
        while ($row = $result_time->fetch_assoc()) {
            $ranking['time'][] = $row;
        }
    } else {
        $response['mensaje'] = 'Error al obtener ranking por tiempo: ' . $conexion->error;
        echo json_encode($response);
        $database->close();
        exit();
    }

    $response['success'] = true;
    $response['mensaje'] = 'Ranking obtenido con éxito.';
    $response['ranking'] = $ranking;

    $database->close();
} else {
    $response['mensaje'] = 'Método no permitido.';
}

echo json_encode($response);