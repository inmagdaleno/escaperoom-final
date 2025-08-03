<?php
require_once '../config/database.php';

header('Content-Type: application/json');

$response = ['success' => false, 'mensaje' => 'Error desconocido.'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener datos del perfil
    session_start();
    
    if (!isset($_SESSION['usuario_id'])) {
        $response['mensaje'] = 'Usuario no autenticado.';
        echo json_encode($response);
        exit();
    }
    
    $database = new Database();
    $conexion = $database->getConexion();
    
    $query = "SELECT nombre, email FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $_SESSION['usuario_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();
        $response['success'] = true;
        $response['mensaje'] = 'Perfil obtenido con éxito.';
        $response['usuario'] = $usuario;
    } else {
        $response['mensaje'] = 'Usuario no encontrado.';
    }
    
    $stmt->close();
    $database->close();
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Actualizar datos del perfil
    session_start();
    
    if (!isset($_SESSION['usuario_id'])) {
        $response['mensaje'] = 'Usuario no autenticado.';
        echo json_encode($response);
        exit();
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['nombre']) || !isset($input['email'])) {
        $response['mensaje'] = 'Datos incompletos.';
        echo json_encode($response);
        exit();
    }
    
    $nombre = trim($input['nombre']);
    $email = trim($input['email']);
    
    if (empty($nombre) || empty($email)) {
        $response['mensaje'] = 'El nombre y email son obligatorios.';
        echo json_encode($response);
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $response['mensaje'] = 'Email inválido.';
        echo json_encode($response);
        exit();
    }
    
    $database = new Database();
    $conexion = $database->getConexion();
    
    // Verificar si el email ya existe (para otro usuario)
    $query_check = "SELECT id FROM usuarios WHERE email = ? AND id != ?";
    $stmt_check = $conexion->prepare($query_check);
    $stmt_check->bind_param("si", $email, $_SESSION['usuario_id']);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows > 0) {
        $response['mensaje'] = 'El email ya está en uso por otro usuario.';
        $stmt_check->close();
        $database->close();
        echo json_encode($response);
        exit();
    }
    $stmt_check->close();
    
    // Actualizar los datos
    $query_update = "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?";
    $stmt_update = $conexion->prepare($query_update);
    $stmt_update->bind_param("ssi", $nombre, $email, $_SESSION['usuario_id']);
    
    if ($stmt_update->execute()) {
        // Actualizar la sesión
        $_SESSION['nombre'] = $nombre;
        $_SESSION['email'] = $email;
        
        $response['success'] = true;
        $response['mensaje'] = 'Perfil actualizado con éxito.';
    } else {
        $response['mensaje'] = 'Error al actualizar el perfil: ' . $conexion->error;
    }
    
    $stmt_update->close();
    $database->close();
    
} else {
    $response['mensaje'] = 'Método no permitido.';
}

echo json_encode($response);
?>
