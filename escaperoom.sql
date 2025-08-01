-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 18, 2025 at 12:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `escaperoom`
--

-- --------------------------------------------------------

--
-- Table structure for table `partida`
--

CREATE TABLE `partida` (
  `id` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_prueba` int(11) NOT NULL,
  `fecha_partida` datetime NOT NULL,
  `tiempo_empleado` int(11) NOT NULL,
  `pistas_usadas` int(1) NOT NULL,
  `puntuacion_final` int(1) NOT NULL,
  `resultado` tinyint(1) NOT NULL DEFAULT 0,
  `modo_juego` varchar(24) DEFAULT 'puntos',
  `tiempo_restante_final` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pruebas`
--

CREATE TABLE `pruebas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(20) NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `tipo_prueba` varchar(20) NOT NULL,
  `solucion` varchar(50) DEFAULT NULL,
  `puntuacion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pruebas`
--

INSERT INTO `pruebas` (`id`, `nombre`, `descripcion`, `tipo_prueba`, `solucion`, `puntuacion`) VALUES
(1, 'mensaje', 'acertijo alfanumerico que consta de un mensaje en una botella que los jugadores deberán desencriptar siguiendo una serie de pistas. Esta encriptado con ROT 13. De la A a la Z debe sumarse 13 cada letra', 'alfanumerico', 'reune las coordenadas', 100),
(3, 'puzzle', 'puzzle drag&drop de un mapa que los jugadores deberan realizar lo mas rapido posible para recoger las pistas que se encuentran en el y que les serviran par resolver el gran enigma final', 'puzzle', NULL, 100),
(4, 'sudoku', 'sudoku geometrico con numeros y formas geometricas que sustituyen a los numeros. las formas geometricas sustituyen al numero igual a su numero de lados', 'sudoku', NULL, 100),
(5, 'final', 'En el gran enigma final tendran que utilizar las pistas encontradas en las anteriores pruebas para encontrar las coordenadas del portal que les permita abandonar la isla antes de que desaparezca', 'coordenadas', NULL, 100);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `email` varchar(60) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `token_recuperacion` varchar(255) NOT NULL,
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `intentos_fallidos` int(11) NOT NULL,
  `bloqueado` int(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `fecha_registro`, `ultimo_acceso`, `token`, `token_recuperacion`, `verificado`, `intentos_fallidos`, `bloqueado`) VALUES
(5, '', 'inmagdaleno@gmail.com', '$2y$10$DWusiIVXK7N7LSIgVni76ek1bk.dvIeazWVgOsXSOBDb0reFF.Jsq', '2025-07-17 10:00:52', '2025-07-17 10:01:39', '', '', 1, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `partida`
--
ALTER TABLE `partida`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_prueba` (`id_prueba`);

--
-- Indexes for table `pruebas`
--
ALTER TABLE `pruebas`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `partida`
--
ALTER TABLE `partida`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pruebas`
--
ALTER TABLE `pruebas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `partida`
--
ALTER TABLE `partida`
  ADD CONSTRAINT `partida_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `partida_ibfk_2` FOREIGN KEY (`id_prueba`) REFERENCES `pruebas` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
