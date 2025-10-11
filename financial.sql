-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-10-2025 a las 04:19:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `financial`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `creditos`
--

CREATE TABLE `creditos` (
  `id_credito` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `interes` decimal(5,2) DEFAULT NULL,
  `tiempo` varchar(50) DEFAULT NULL,
  `solca` tinyint(1) DEFAULT 0,
  `gravamen` tinyint(1) DEFAULT 0,
  `informacion` text DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `creditos`
--

INSERT INTO `creditos` (`id_credito`, `nombre`, `descripcion`, `tipo`, `interes`, `tiempo`, `solca`, `gravamen`, `informacion`, `estado`, `imagen`) VALUES
(1, 'Mobiliario', 'AAA', 'Hipotecario', 10.00, '80 MESES', 1, 1, 'AAAA', 1, ''),
(3, 'Crédito Automotriz', 'Se utiliza para la compra de vehículos nuevos o usados.', 'Automotriz', 10.50, '12-84 meses', 1, 0, 'Financiamiento para automóviles, motos y vehículos comerciales.', 1, ''),
(4, 'Crédito de Consumo', 'Cubre necesidades de bienes y servicios. Incluye tarjetas de crédito, crédito de nómina y crédito personal.', 'Consumo', 15.00, '3-60 meses', 0, 0, 'Ideal para gastos imprevistos, viajes, electrodomésticos y compras puntuales.', 1, ''),
(5, 'Crédito Prendario', 'Para la compra de un bien mueble que queda como garantía hasta que se liquide la deuda.', 'Prendario', 11.00, '6-60 meses', 1, 0, 'Joyas, electrodomésticos, equipos electrónicos como garantía.', 1, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `info_inst`
--

CREATE TABLE `info_inst` (
  `id_info` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `slogan` varchar(255) DEFAULT NULL,
  `color_primario` varchar(10) DEFAULT NULL,
  `color_secundario` varchar(10) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `pais` varchar(100) DEFAULT NULL,
  `owner` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `info_inst`
--

INSERT INTO `info_inst` (`id_info`, `nombre`, `logo`, `slogan`, `color_primario`, `color_secundario`, `direccion`, `pais`, `owner`, `telefono`, `correo`, `estado`) VALUES
(1, 'BANCO TU BANCO', 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/768881137475311.620bf35301822.jpg', 'Tu banco, tu dinero', '#d38ee1', '#bea5ee', 'Ambato', 'Ecuador', 'owner', 'aaa', 'bancoprueba@gmail.com', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inversiones`
--

CREATE TABLE `inversiones` (
  `id_inversion` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `rendimiento` decimal(5,2) DEFAULT NULL,
  `plazo` varchar(50) DEFAULT NULL,
  `riesgo` varchar(50) DEFAULT NULL,
  `informacion` text DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1,
  `imagen` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `cedula` char(10) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `clave` varchar(50) NOT NULL,
  `tipo` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `cedula`, `usuario`, `clave`, `tipo`, `nombre`) VALUES
(1, '1850221761', 'admin', 'admin', 1, 'MIADMIN'),
(2, '1850221762', 'user', 'user', 0, 'MIUSUARIO');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `creditos`
--
ALTER TABLE `creditos`
  ADD PRIMARY KEY (`id_credito`);

--
-- Indices de la tabla `info_inst`
--
ALTER TABLE `info_inst`
  ADD PRIMARY KEY (`id_info`);

--
-- Indices de la tabla `inversiones`
--
ALTER TABLE `inversiones`
  ADD PRIMARY KEY (`id_inversion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `creditos`
--
ALTER TABLE `creditos`
  MODIFY `id_credito` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `info_inst`
--
ALTER TABLE `info_inst`
  MODIFY `id_info` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `inversiones`
--
ALTER TABLE `inversiones`
  MODIFY `id_inversion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
