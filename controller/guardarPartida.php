<?php
require_once '../config/database.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'mensaje' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id_usuario = $_SESSION['usuario_id'];
$id_prueba = isset($data['id_prueba']) ? intval($data['id_prueba']) : null;
$tiempo_empleado = isset($data['tiempo_empleado']) ? intval($data['tiempo_empleado']) : null;
$pistas_usadas = isset($data['pistas_usadas']) ? intval($data['pistas_usadas']) : 0;
$puntuacion_final = isset($data['puntuacion_final']) ? intval($data['puntuacion_final']) : null;
$resultado = isset($data['resultado']) ? intval($data['resultado']) : 0;
$modo_juego = isset($data['modo_juego']) ? $data['modo_juego'] : 'puntos';
$tiempo_restante_final = isset($data['tiempo_restante_final']) ? intval($data['tiempo_restante_final']) : null;

// Validación básica
if (
    !$id_prueba ||
    $tiempo_empleado === null ||
    !in_array($modo_juego, ['puntos', 'tiempo'])
) {
    echo json_encode(['success' => false, 'mensaje' => 'Datos incompletos o incorrectos']);
    exit;
}

$database = new Database();
$conexion = $database->getConexion();

$stmt = $conexion->prepare("INSERT INTO partida (id_usuario, id_prueba, fecha_partida, tiempo_empleado, pistas_usadas, puntuacion_final, resultado, modo_juego, tiempo_restante_final) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)");
$stmt->bind_param(
    "iiiiiiisi",
    $id_usuario,
    $id_prueba,
    $tiempo_empleado,
    $pistas_usadas,
    $puntuacion_final,
    $resultado,
    $modo_juego,
    $tiempo_restante_final
);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Error al guardar partida: ' . $stmt->error]);
}
$stmt->close();
$database->close();