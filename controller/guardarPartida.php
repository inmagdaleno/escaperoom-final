<?php
require_once '../config/database.php';
session_start();

header('Content-Type: application/json');

// Log de debug - quitar en producción
error_log("=== INICIO GUARDAR PARTIDA ===");

if (!isset($_SESSION['usuario_id'])) {
    error_log("ERROR: Usuario no autorizado");
    http_response_code(401);
    echo json_encode(['success' => false, 'mensaje' => 'No autorizado']);
    exit;
}

error_log("Usuario ID: " . $_SESSION['usuario_id']);

$data = json_decode(file_get_contents("php://input"), true);
error_log("Datos recibidos: " . print_r($data, true));

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
    error_log("ERROR: Datos incompletos - id_prueba: $id_prueba, tiempo_empleado: $tiempo_empleado, modo_juego: $modo_juego");
    echo json_encode(['success' => false, 'mensaje' => 'Datos incompletos o incorrectos']);
    exit;
}

error_log("Validación pasada. Conectando a BD...");

$database = new Database();
$conexion = $database->getConexion();

if (!$conexion) {
    error_log("ERROR: No se pudo conectar a la BD");
    echo json_encode(['success' => false, 'mensaje' => 'Error de conexión a la base de datos']);
    exit;
}

error_log("Conexión a BD exitosa. Preparando statement...");

$stmt = $conexion->prepare("INSERT INTO partida (id_usuario, id_prueba, fecha_partida, tiempo_empleado, pistas_usadas, puntuacion_final, resultado, modo_juego, tiempo_restante_final) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?)");

if (!$stmt) {
    error_log("ERROR: No se pudo preparar statement: " . $conexion->error);
    echo json_encode(['success' => false, 'mensaje' => 'Error preparando consulta']);
    exit;
}

error_log("Statement preparado. Bindeando parámetros...");
error_log("Parámetros: usuario=$id_usuario, prueba=$id_prueba, tiempo=$tiempo_empleado, pistas=$pistas_usadas, puntuacion=$puntuacion_final, resultado=$resultado, modo=$modo_juego, tiempo_restante=$tiempo_restante_final");
$stmt->bind_param(
    "iiiiiisi",
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
    error_log("SUCCESS: Partida guardada exitosamente. ID: " . $stmt->insert_id);
    echo json_encode(['success' => true]);
} else {
    error_log("ERROR: No se pudo ejecutar statement: " . $stmt->error);
    echo json_encode(['success' => false, 'mensaje' => 'Error al guardar partida: ' . $stmt->error]);
}
$stmt->close();
$database->close();