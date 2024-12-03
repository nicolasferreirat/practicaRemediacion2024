CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS USUARIOS (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  apellido VARCHAR(30) NOT NULL,
  nombre_usuario VARCHAR(30) UNIQUE NOT NULL,
  mail VARCHAR(100) UNIQUE NOT NULL,
  imagen BYTEA,
  password TEXT NOT NULL
);

-- Tabla de creación de marcador
CREATE TABLE IF NOT EXISTS CREA (
  id_usuario INT NOT NULL,
  id_marcador INT NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL
);

-- Tabla de clubes
CREATE TABLE IF NOT EXISTS CLUBES (
  id_club SERIAL PRIMARY KEY,
  nombre_club VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  contacto VARCHAR(50),
  cant_pistas INT NOT NULL
);

-- Tabla de marcadores
CREATE TABLE IF NOT EXISTS MARCADORES (
  id_marcador SERIAL PRIMARY KEY,
  pin_editar VARCHAR(4),
  pin_compartir VARCHAR(4),
  descripcion_competencia TEXT,
  nombre_pareja_A1 VARCHAR(100) NOT NULL,
  nombre_pareja_A2 VARCHAR(100) NOT NULL,
  nombre_pareja_B1 VARCHAR(100) NOT NULL,
  nombre_pareja_B2 VARCHAR(100) NOT NULL,
  set1A INT NOT NULL,
  set2A INT NOT NULL,
  set3A INT NOT NULL,
  set1B INT NOT NULL,
  set2B INT NOT NULL,
  set3B INT NOT NULL,
  puntosA INT NOT NULL,
  puntosB INT NOT NULL,
  ventaja BOOLEAN NOT NULL,
  es_supertiebreak BOOLEAN NOT NULL,
  set_largo BOOLEAN NOT NULL,
  id_usuario INT NOT NULL,
  id_club INT NOT NULL,
  fecha_creacion TIMESTAMP NOT NULL,
  duracion_partido TIME
);

-- Tabla de sets
CREATE TABLE IF NOT EXISTS SETS (
  id_set SERIAL PRIMARY KEY,
  nombre_set VARCHAR(100),
  games_parejaA INT NOT NULL,
  games_parejaB INT NOT NULL,
  id_marcador INT NOT NULL
);

-- Tabla de historial
CREATE TABLE IF NOT EXISTS HISTORIAL (
  id_marcador INT NOT NULL,
  id_club INT NOT NULL,
  fecha_registro TIMESTAMP NOT NULL
);

-- Tabla de historial
CREATE TABLE IF NOT EXISTS AMERICANOS (
  id_americano SERIAL PRIMARY KEY,
  descripcion_torneo TEXT,
  numeroRonda INT,
  jugador1 VARCHAR(100) NOT NULL,
  jugador2 VARCHAR(100) NOT NULL,
  jugador3 VARCHAR(100) NOT NULL,
  jugador4 VARCHAR(100) NOT NULL,
  jugador5 VARCHAR(100) NOT NULL,
  jugador6 VARCHAR(100) NOT NULL,
  jugador7 VARCHAR(100) NOT NULL,
  jugador8 VARCHAR(100) NOT NULL,
  puntosJ1 INT,
  puntosJ2 INT,
  puntosJ3 INT,
  puntosJ4 INT,
  puntosJ5 INT,
  puntosJ6 INT,
  puntosJ7 INT,
  puntosJ8 INT,
  puesto1 VARCHAR(100),
  puntos1 INT,
  puesto2 VARCHAR(100),
  puntos2 INT,
  puesto3 VARCHAR(100),
  puntos3 INT,
  fecha_registro TIMESTAMP NULL
);

-- Agregar llaves foráneas después de la creación de las tablas
ALTER TABLE CREA
ADD CONSTRAINT fk_crea_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id),
ADD CONSTRAINT fk_crea_marcador FOREIGN KEY (id_marcador) REFERENCES MARCADORES(id_marcador);

ALTER TABLE MARCADORES
ADD CONSTRAINT fk_marcador_usuario FOREIGN KEY (id_usuario) REFERENCES USUARIOS(id),
ADD CONSTRAINT fk_id_club FOREIGN KEY (id_club) REFERENCES CLUBES(id_club);

ALTER TABLE SETS
ADD CONSTRAINT fk_set_marcador FOREIGN KEY (id_marcador) REFERENCES MARCADORES(id_marcador);

ALTER TABLE HISTORIAL
ADD CONSTRAINT fk_historial_marcador FOREIGN KEY (id_marcador) REFERENCES MARCADORES(id_marcador),
ADD CONSTRAINT fk_historial_club FOREIGN KEY (id_club) REFERENCES CLUBES(id_club);

-- Aleterna lo de clubes 
ALTER TABLE CLUBES
ADD COLUMN logo BYTEA,
ADD COLUMN foto BYTEA;

-- Insertar datos de ejemplo
INSERT INTO USUARIOS (nombre, apellido, nombre_usuario, mail, imagen, password)
VALUES 
('Juan', 'Jacques', 'JuandiJ7', 'juan.jacques@example.com', NULL, crypt('123', gen_salt('bf'))),
('Nicolas', 'Ferreira', 'NicoFer', 'nicolas.ferreira@example.com', NULL, crypt('123', gen_salt('bf'))),
('Lucas', 'Rodriguez', 'LucasRod', 'lucas.rodriguez@example.com', NULL, crypt('123', gen_salt('bf'))),
('Alejandro', 'Galán', 'AleGal', 'alejandro.galan@example.com', NULL, crypt('Gal1nPadel!', gen_salt('bf'))),
('Juan', 'Lebrón', 'LebronJ', 'juan.lebron@example.com', NULL, crypt('Lebr0nPadel!', gen_salt('bf'))),
('Paquito', 'Navarro', 'PaquitoN', 'paquito.navarro@example.com', NULL, crypt('Paqu1t0Padel!', gen_salt('bf'))),
('Federico', 'Chingotto', 'FedeC', 'federico.chingotto@example.com', NULL, crypt('Ch1ng0tt0!', gen_salt('bf'))),
('Martín', 'Di Nenno', 'MartinDN', 'martin.dinenno@example.com', NULL, crypt('D1N3nn0!', gen_salt('bf'))),
('Agustín', 'Tapia', 'AgusT', 'agustin.tapia@example.com', NULL, crypt('T4p1aP4d3l!', gen_salt('bf'))),
('Franco', 'Stupaczuk', 'StupaF', 'franco.stupaczuk@example.com', NULL, crypt('StuP4czuk!', gen_salt('bf'))),
('Sanyo', 'Gutiérrez', 'SanyoG', 'sanyo.gutierrez@example.com', NULL, crypt('S4ny0G!', gen_salt('bf')));

INSERT INTO CLUBES (nombre_club, direccion, contacto, cant_pistas)
VALUES 
('Salto Padel Center', 'Juan Pablo II', '099042704', 2), --1
('El Galpon Padel Club', 'Av. Barbieri', '099468730', 3), --2
('Arsenal Padel', 'Agraciada 741', '094348618', 2), --3
('Open Padel', 'Intendente Juan H. Paiva 2300', '099592194', 2), --4
('Ferro Carril Padel', ' Juan Manuel Blanes 160', '097091546', 1); --5

INSERT INTO MARCADORES (pin_editar, pin_compartir, descripcion_competencia, nombre_pareja_A1, nombre_pareja_A2, nombre_pareja_B1, nombre_pareja_B2, set1A, set2A, set3A, set1B, set2B, set3B, puntosA, puntosB, ventaja, es_supertiebreak, set_largo, id_usuario, id_club, fecha_creacion, duracion_partido)
VALUES 
(NULL, NULL, 'Torneo Suma 5 Septiembre', 'Jacques', 'Dalves', 'Ferreira', 'Yarruz', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, TRUE, 1, 1, '2024-09-05 10:30:00', '01:30:00'),
(NULL, NULL, 'Torneo Suma 5 Abril', 'Jacques', 'Fusco', 'Ferreira', 'Yarruz', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, FALSE, 2, 2, '2024-04-05 14:00:00', '01:00:00'),
(NULL, NULL, NULL, 'Rodriguez', 'Jacques', 'Tanca', 'Ferreira', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, TRUE, 3, 2, '2024-08-20 16:45:00', '01:10:00'),
(NULL, NULL, 'Torneo Invierno', 'Gomez', 'Martinez', 'Lopez', 'Jacques', 0, 0, 0, 0, 0, 0, 0, 0, TRUE, FALSE, TRUE, 4, 5, '2024-06-25 19:20:00', '01:15:00'),
(NULL, NULL, 'Torneo Verano', 'Gomez', 'Rodriguez', 'Martinez', 'Ferreira', 0, 0, 0, 0, 0, 0, 0, 0, TRUE, TRUE, TRUE, 5, 1, '2024-02-18 11:10:00', '01:40:00'),
(NULL, NULL, 'Torneo Primavera', 'Tapia', 'Chingotto', 'Jacques', 'Galan', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, FALSE, TRUE, 6, 2, '2024-10-15 15:25:00', '00:50:00'),
(NULL, NULL, 'Torneo Arsenal Padel - Cuartos', 'Jacques', 'Ramos', 'Rodriguez', 'Arrambide', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, FALSE, 1, 1, '2024-03-22 12:40:00', '01:30:00'),
(NULL, NULL, 'Torneo Arsenal Padel - Semis', 'Jacques', 'Ramos', 'Franzoni', 'Fernandez', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, FALSE, 2, 2, '2024-03-23 14:10:00', '01:00:00'),
(NULL, NULL, 'Torneo Arsenal Padel - Final', 'Ramos', 'Jacques', 'Caubarrere', 'Amarillo', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, FALSE, TRUE, 3, 2, '2024-03-24 16:00:00', '01:10:00'),
(NULL, NULL, 'Torneo Invierno', 'Gomez', 'Martinez', 'Lopez', 'Jacques', 0, 0, 0, 0, 0, 0, 0, 0, TRUE, FALSE, TRUE, 4, 5, '2024-06-26 18:15:00', '01:15:00'),
(NULL, NULL, 'Torneo Verano', 'Gomez', 'Rodriguez', 'Martinez', 'Ferreira', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, TRUE, TRUE, 5, 4, '2024-01-15 10:30:00', '01:40:00'),
(NULL, NULL, 'Torneo Primavera', 'Tapia', 'Chingotto', 'Jacques', 'Galan', 0, 0, 0, 0, 0, 0, 0, 0, FALSE, FALSE, TRUE, 6, 3, '2024-10-16 13:50:00', '00:50:00');



INSERT INTO CREA (id_usuario, id_marcador, fecha_creacion)
VALUES 
(1, 1, '2024-10-10 12:00:00'),
(2, 2, '2024-10-11 14:00:00'),
(3, 3, '2024-10-12 16:30:00'),
(4, 4, '2024-10-15 09:00:00'),
(5, 5, '2024-10-18 11:00:00'),
(6, 6, '2024-10-20 13:30:00'),
(1, 7, '2024-10-21 10:00:00'),
(2, 8, '2024-10-22 15:30:00'),
(3, 9, '2024-10-23 14:00:00'),
(4, 10, '2024-10-24 11:30:00'),
(5, 11, '2024-10-25 16:00:00'),
(6, 12, '2024-10-26 13:45:00');

INSERT INTO SETS (nombre_set, games_parejaA, games_parejaB, id_marcador)
VALUES 
('Set 1 1234', 6, 4, 1),
('Set 2 1234', 6, 3, 1),
('Set 1 5678', 3, 6, 2),
('Set 2 5678', 6, 4, 2),
('Set 3 5678', 11, 8, 2),
('Set 1 9012', 6, 4, 3),
('Set 2 9012', 7, 6, 3),
('Set 1 1234', 6, 4, 4),
('Set 2 1234', 6, 3, 4),
('Set 1 5678', 3, 6, 5),
('Set 2 5678', 6, 4, 5),
('Set 3 5678', 11, 8, 5),
('Set 1 9012', 6, 4, 6),
('Set 2 9012', 7, 6, 6),
('Set 1 1234', 6, 4, 7),
('Set 2 1234', 6, 3, 7),
('Set 1 5678', 3, 6, 8),
('Set 2 5678', 6, 4, 8),
('Set 3 5678', 11, 8, 8),
('Set 1 9012', 6, 4, 9),
('Set 2 9012', 7, 6, 9),
('Set 1 1234', 6, 4, 10),
('Set 2 1234', 6, 3, 10),
('Set 1 5678', 3, 6, 11),
('Set 2 5678', 6, 4, 11),
('Set 3 5678', 11, 8, 11),
('Set 1 9012', 6, 4, 12),
('Set 2 9012', 7, 6, 12);

INSERT INTO HISTORIAL (id_marcador, id_club, fecha_registro)
VALUES 
(1, 1, '2024-09-05 12:00:00'),
(2, 2, '2024-04-05 10:00:00'),
(3, 2, '2024-05-01 09:30:00'),
(4, 5, '2024-06-20 15:00:00'),
(5, 1, '2024-07-15 14:00:00'),
(6, 2, '2024-08-10 11:00:00'),
(7, 1, '2024-09-10 10:30:00'),
(8, 2, '2024-09-15 13:45:00'),
(9, 2, '2024-10-01 16:00:00'),
(10, 5, '2024-10-20 18:00:00'),
(11, 4, '2024-10-22 17:00:00'),
(12, 3, '2024-10-25 19:00:00');

INSERT INTO AMERICANOS (
  descripcion_torneo, jugador1, jugador2, jugador3, jugador4, jugador5, jugador6, jugador7, jugador8,
  puesto1, puntos1, puesto2, puntos2, puesto3, puntos3, fecha_registro
)
VALUES
('Torneo de Primavera', 'Juan Pérez', 'Luis Gómez', 'Ana Torres', 'Carlos Sánchez', 'María López', 'Pedro Díaz', 'Laura Fernández', 'Jorge Ruiz', 
 'Juan Pérez', 240, 'Ana Torres', 220, 'Luis Gómez', 200, '2024-03-15 10:00:00'),

('Torneo de Verano', 'Roberto Martínez', 'Andrea García', 'Miguel Herrera', 'Sofía Castro', 'Gabriel Álvarez', 'Lucía Vega', 'David Ortiz', 'Paula Morales', 
 'Andrea García', 240, 'Roberto Martínez', 220, 'Miguel Herrera', 200, '2024-06-10 14:30:00'),

('Torneo de Otoño', 'Fernando Ríos', 'Claudia Romero', 'Daniel Navarro', 'Patricia Ramos', 'Oscar Vázquez', 'Carmen Jiménez', 'Alfredo Flores', 'Elsa Pérez', 
 'Daniel Navarro', 240, 'Patricia Ramos', 220, 'Fernando Ríos', 200, '2024-09-05 16:00:00'),

('Torneo de Invierno', 'Francisco Aguilar', 'Sara Peña', 'Héctor Medina', 'Valeria Lozano', 'Santiago Castillo', 'Natalia Herrera', 'Emilio Campos', 'Adriana Lara', 
 'Valeria Lozano', 240, 'Santiago Castillo', 220, 'Francisco Aguilar', 200, '2024-11-05 18:00:00'),

('Copa Ciudadana', 'Marcos Ruiz', 'Isabel Gómez', 'Raúl Morales', 'Elena Vargas', 'Hugo Prieto', 'Lorena Mendoza', 'Ignacio Ortega', 'Diana Figueroa', 
 'Elena Vargas', 240, 'Hugo Prieto', 220, 'Raúl Morales', 200, '2024-08-20 09:30:00'),

('Desafío Elite', 'Cristina Solís', 'José Lara', 'Alba Fernández', 'Martín Espinoza', 'Alejandro Guzmán', 'Gabriela Torres', 'Pablo Ramírez', 'Sofía Domínguez', 
 'Martín Espinoza', 240, 'Cristina Solís', 220, 'José Lara', 200, '2024-07-12 15:45:00'),

('Copa Nacional', 'Victoria Gil', 'Andrés Paredes', 'Mónica Rivero', 'Hernán Rivas', 'Clara Aguilar', 'Felipe Rosales', 'Silvia Blanco', 'Rodrigo López', 
 'Hernán Rivas', 240, 'Mónica Rivero', 220, 'Victoria Gil', 200, '2024-05-25 11:20:00'),

('Copa Interclubes', 'Javier Reyes', 'Teresa Maldonado', 'Raquel García', 'Tomás Domínguez', 'Inés Méndez', 'Sebastián Torres', 'Julia Rodríguez', 'Manuel Herrera', 
 'Raquel García', 240, 'Javier Reyes', 220, 'Tomás Domínguez', 200, '2024-10-02 13:10:00'),

('Desafío Regional', 'Carla Vargas', 'Esteban Sánchez', 'Lucía Martínez', 'Gonzalo Pérez', 'Angela Guzmán', 'Iván Romero', 'Rafael Silva', 'Eva Morales', 
 'Lucía Martínez', 240, 'Carla Vargas', 220, 'Gonzalo Pérez', 200, '2024-04-14 17:25:00'),

('Torneo de Campeones', 'Nicolás Torres', 'Sofía López', 'Samuel Romero', 'Andrea Rodríguez', 'Ricardo González', 'Paula Navarro', 'Luis Martínez', 'Carmen Ramos', 
 'Andrea Rodríguez', 240, 'Ricardo González', 220, 'Sofía López', 200, '2024-11-10 19:40:00'),

('Copa de Plata', 'Diego López', 'Camila Ramírez', 'Iván Herrera', 'Elisa Núñez', 'Francisco Oliva', 'Beatriz Torres', 'Santiago Vega', 'Ángela Pérez', 
 'Camila Ramírez', 240, 'Diego López', 220, 'Iván Herrera', 200, '2024-03-18 14:15:00'),

('Liga de Honor', 'Mariana Díaz', 'César Torres', 'Renata López', 'Alfonso Gómez', 'Paola Castillo', 'Fabián Herrera', 'Diana Ramos', 'Gabriel Domínguez', 
 'Renata López', 240, 'Mariana Díaz', 220, 'César Torres', 200, '2024-02-05 11:50:00'),

('Torneo Abierto', 'Sergio Vargas', 'Marta Jiménez', 'Julio Rivera', 'Claudia Torres', 'Esteban Guzmán', 'Lucía Ramírez', 'Carlos Méndez', 'Elena López', 
 'Sergio Vargas', 240, 'Julio Rivera', 220, 'Marta Jiménez', 200, '2024-01-20 15:30:00');




