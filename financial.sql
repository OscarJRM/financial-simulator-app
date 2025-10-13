-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-10-2025 a las 11:18:03
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.3.12

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
-- Estructura de tabla para la tabla `creditostabla`
--

CREATE TABLE `creditostabla` (
  `id_credito` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `interes` decimal(10,2) DEFAULT NULL,
  `informacion` text DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `plazo_min` int(11) NOT NULL,
  `plazo_max` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `creditostabla`
--

INSERT INTO `creditostabla` (`id_credito`, `nombre`, `descripcion`, `tipo`, `interes`, `informacion`, `estado`, `plazo_min`, `plazo_max`) VALUES
(0, 'Credito Educacion', 'Para inicio a clases', 'Educacion', 12.00, 'buena pregunta', 1, 6, 24),
(1, 'Crédito Hipotecario', 'Para tu primer vivienda', 'hipotecario', 8.20, '', 1, 60, 25),
(2, 'Crédito personal', 'Para compras de hogar', 'Personal', 15.00, 'Para personal', 1, 3, 24);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `credito_indirecto`
--

CREATE TABLE `credito_indirecto` (
  `id_credito` int(11) NOT NULL,
  `id_indirecto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `credito_indirecto`
--

INSERT INTO `credito_indirecto` (`id_credito`, `id_indirecto`) VALUES
(0, 3),
(1, 2),
(2, 2),
(2, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `financial_perfil_usuario`
--

CREATE TABLE `financial_perfil_usuario` (
  `id_perfil` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `primer_nombre` varchar(50) NOT NULL,
  `segundo_nombre` varchar(50) DEFAULT NULL,
  `primer_apellido` varchar(50) NOT NULL,
  `segundo_apellido` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `cedula_frontal_uri` varchar(255) DEFAULT NULL,
  `cedula_reverso_uri` varchar(255) DEFAULT NULL,
  `selfie_uri` varchar(255) DEFAULT NULL,
  `verificado` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `financial_perfil_usuario`
--

INSERT INTO `financial_perfil_usuario` (`id_perfil`, `id_usuario`, `primer_nombre`, `segundo_nombre`, `primer_apellido`, `segundo_apellido`, `fecha_nacimiento`, `telefono`, `cedula_frontal_uri`, `cedula_reverso_uri`, `selfie_uri`, `verificado`, `fecha_creacion`) VALUES
(1, 3, 'Oscar', 'Joel', 'Ramirez', 'Manzano', '2003-08-07', '0992849536', 'https://pcjrjqlmepgyqujuwzig.supabase.co/storage/v1/object/public/cedulas/1850210004_cedula-frontal_1760343263113.jpg', 'https://pcjrjqlmepgyqujuwzig.supabase.co/storage/v1/object/public/cedulas/1850210004_cedula-reverso_1760343275247.jpg', 'https://pcjrjqlmepgyqujuwzig.supabase.co/storage/v1/object/public/selfies/1850210004_selfie_1760343282882.jpg', 1, '2025-10-13 08:14:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indirect`
--

CREATE TABLE `indirect` (
  `id_indirecto` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `interes` decimal(10,2) NOT NULL,
  `tipo_interes` varchar(20) NOT NULL CHECK (`tipo_interes` in ('porcentaje','desembolso'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `indirect`
--

INSERT INTO `indirect` (`id_indirecto`, `nombre`, `tipo`, `interes`, `tipo_interes`) VALUES
(2, 'Solca', 'Gobernamental', 0.05, 'porcentaje'),
(3, 'seguro', 'vida', 150.00, 'desembolso');

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
(1, 'BANCO CHILL DE COJONEEEES', 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/768881137475311.620bf35301822.jpg', 'Tu banco, tu dinero', '#c4d8f8', '#dedede', 'Ambato', 'Ecuador', 'owner', 'aaa', 'bancoprueba@gmail.com', 1),
(2, 'TEst', 'https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/768881137475311.620bf35301822.jpg', 'djsdnhj', NULL, NULL, 'sdasd', NULL, NULL, 'sdsdasd', 'sdasdasd', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inversiones`
--

CREATE TABLE `inversiones` (
  `id` int(11) NOT NULL,
  `tipo_inversion_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('Activo','Inactivo') DEFAULT 'Activo',
  `monto_minimo` decimal(12,2) NOT NULL DEFAULT 0.00,
  `monto_maximo` decimal(12,2) DEFAULT NULL,
  `plazo_min_meses` int(11) NOT NULL DEFAULT 1,
  `plazo_max_meses` int(11) DEFAULT NULL,
  `tasa_anual` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inversiones`
--

INSERT INTO `inversiones` (`id`, `tipo_inversion_id`, `nombre`, `descripcion`, `estado`, `monto_minimo`, `monto_maximo`, `plazo_min_meses`, `plazo_max_meses`, `tasa_anual`) VALUES
(1, 1, 'Plazo Fijo', 'Inversión a plazo fijo con tasa fija garantizada', 'Activo', 1000.00, 100000.00, 12, 36, 10.00),
(2, 3, 'Test', 'Test', 'Inactivo', 100.00, 100000.00, 10, 60, 8.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud_inversion`
--

CREATE TABLE `solicitud_inversion` (
  `id_solicitud` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_inversion` int(11) NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `plazo_meses` int(11) NOT NULL,
  `ingresos` decimal(12,2) DEFAULT NULL,
  `egresos` decimal(12,2) DEFAULT NULL,
  `empresa` varchar(150) DEFAULT NULL,
  `ruc` varchar(13) DEFAULT NULL,
  `tipo_empleo` enum('Dependencia','Independiente','Otro') DEFAULT NULL,
  `documento_validacion_uri` varchar(255) DEFAULT NULL,
  `estado` enum('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',
  `observacion_admin` text DEFAULT NULL,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitud_inversion`
--

INSERT INTO `solicitud_inversion` (`id_solicitud`, `id_usuario`, `id_inversion`, `monto`, `plazo_meses`, `ingresos`, `egresos`, `empresa`, `ruc`, `tipo_empleo`, `documento_validacion_uri`, `estado`, `observacion_admin`, `fecha_solicitud`) VALUES
(1, 3, 1, 5000.00, 12, 5000.00, 1200.00, 'Malvados y asociados', '1850210004000', 'Dependencia', 'https://pcjrjqlmepgyqujuwzig.supabase.co/storage/v1/object/public/documents/3_documento-validacion_1760344597102.pdf', 'Aprobado', '', '2025-10-13 08:46:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_inversion`
--

CREATE TABLE `tipo_inversion` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel_riesgo` enum('Bajo','Medio','Alto') DEFAULT 'Medio',
  `tipo_interes` enum('Simple','Compuesto') DEFAULT 'Compuesto',
  `tipo_tasa` enum('Fija','Variable') DEFAULT 'Fija'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_inversion`
--

INSERT INTO `tipo_inversion` (`id`, `nombre`, `descripcion`, `nivel_riesgo`, `tipo_interes`, `tipo_tasa`) VALUES
(1, 'Plazo fijo', 'Inversión a plazo determinado con tasa fija o variable, capital garantizado', 'Bajo', 'Compuesto', 'Fija'),
(2, 'Fondo de renta fija', 'Fondo que invierte principalmente en bonos y activos de renta fija, rendimiento moderado', 'Medio', 'Compuesto', 'Variable'),
(3, 'Fondo mixto', 'Fondo que combina renta fija y variable para diversificar riesgos y rendimientos', 'Medio', 'Compuesto', 'Variable'),
(4, 'Fondo de renta variable', 'Fondo que invierte en acciones y activos de alto riesgo, rendimiento potencial alto', 'Alto', 'Compuesto', 'Variable');

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
(2, '1850221762', 'user', 'user', 0, 'MIUSUARIO'),
(3, '1850210004', 'oscar78203', '123456', 0, 'Oscar Ramirez');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `creditostabla`
--
ALTER TABLE `creditostabla`
  ADD PRIMARY KEY (`id_credito`);

--
-- Indices de la tabla `credito_indirecto`
--
ALTER TABLE `credito_indirecto`
  ADD PRIMARY KEY (`id_credito`,`id_indirecto`),
  ADD KEY `fk_credito_indirecto_indirect` (`id_indirecto`);

--
-- Indices de la tabla `financial_perfil_usuario`
--
ALTER TABLE `financial_perfil_usuario`
  ADD PRIMARY KEY (`id_perfil`),
  ADD KEY `id_usuario` (`id_usuario`);

--
-- Indices de la tabla `indirect`
--
ALTER TABLE `indirect`
  ADD PRIMARY KEY (`id_indirecto`);

--
-- Indices de la tabla `info_inst`
--
ALTER TABLE `info_inst`
  ADD PRIMARY KEY (`id_info`);

--
-- Indices de la tabla `inversiones`
--
ALTER TABLE `inversiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_productos_inversion_tipo` (`tipo_inversion_id`);

--
-- Indices de la tabla `solicitud_inversion`
--
ALTER TABLE `solicitud_inversion`
  ADD PRIMARY KEY (`id_solicitud`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_inversion` (`id_inversion`);

--
-- Indices de la tabla `tipo_inversion`
--
ALTER TABLE `tipo_inversion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `financial_perfil_usuario`
--
ALTER TABLE `financial_perfil_usuario`
  MODIFY `id_perfil` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `info_inst`
--
ALTER TABLE `info_inst`
  MODIFY `id_info` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `inversiones`
--
ALTER TABLE `inversiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `solicitud_inversion`
--
ALTER TABLE `solicitud_inversion`
  MODIFY `id_solicitud` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `tipo_inversion`
--
ALTER TABLE `tipo_inversion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `credito_indirecto`
--
ALTER TABLE `credito_indirecto`
  ADD CONSTRAINT `credito_indirecto_ibfk_2` FOREIGN KEY (`id_indirecto`) REFERENCES `indirect` (`id_indirecto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_credito_indirecto_creditos` FOREIGN KEY (`id_credito`) REFERENCES `creditostabla` (`id_credito`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_credito_indirecto_indirect` FOREIGN KEY (`id_indirecto`) REFERENCES `indirect` (`id_indirecto`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `financial_perfil_usuario`
--
ALTER TABLE `financial_perfil_usuario`
  ADD CONSTRAINT `financial_perfil_usuario_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `inversiones`
--
ALTER TABLE `inversiones`
  ADD CONSTRAINT `fk_productos_inversion_tipo` FOREIGN KEY (`tipo_inversion_id`) REFERENCES `tipo_inversion` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitud_inversion`
--
ALTER TABLE `solicitud_inversion`
  ADD CONSTRAINT `solicitud_inversion_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `solicitud_inversion_ibfk_2` FOREIGN KEY (`id_inversion`) REFERENCES `inversiones` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
