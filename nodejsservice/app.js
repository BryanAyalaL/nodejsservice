// Importar express
const express = require('express');

// Crear una aplicación express
const app = express();

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000'] // Añadir la IP del emulador si es necesario
}));


// Definir una ruta GET
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Definir una ruta POST
app.post('/mensaje', (req, res) => {
  const { texto } = req.body;
  if (texto) {
    res.json({ mensaje: `Recibido: ${texto}` });
  } else {
    res.status(400).json({ error: 'El campo "texto" es requerido' });
  }
});

const mysql = require('mysql2');

// Crear una aplicación express
// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Configurar la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',     // Dirección del servidor MySQL
  user: 'root',          // Tu usuario de MySQL
  password: '',          // Tu contraseña de MySQL
  database: 'ecovidrio_export' // El nombre de tu base de datos
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

// Ruta GET para obtener los datos de sensores, resultados y trituradoras
app.get('/peso', (req, res) => {
  const query = `
    SELECT
      r.fecha,
      r.peso,
      t.nombre AS trituradora
    FROM
      resultado r
    JOIN
      sensor s ON s.idsensor = r.idsensor
    JOIN
      trituradora t ON t.idsensor = s.idsensor;
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al hacer la consulta:', err);
      return res.status(500).json({ error: 'Hubo un error al consultar los datos' });
    }
    res.json(results); // Retorna los resultados de la consulta
  });
});

// Ruta GET para obtener los datos de sensores, resultados y trituradoras
app.get('/color', (req, res) => {
  const query = `
    SELECT 
        r.hora,
        r.color,
        r.fecha,
        t.nombre AS trituradora
    FROM 
        resultado r
    JOIN 
        sensor s ON r.idsensor = s.idsensor
    JOIN 
        trituradora t ON t.idsensor = s.idsensor;

  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al hacer la consulta:', err);
      return res.status(500).json({ error: 'Hubo un error al consultar los datos' });
    }
    res.json(results); // Retorna los resultados de la consulta
  });
});

// Ruta GET para obtener los resultados
app.get('/resultado', (req, res) => {
  const query = `
    SELECT 
        r.peso, 
        r.color, 
        r.hora, 
        r.fecha, 
        t.nombre AS maquina
    FROM 
        resultado r
    JOIN 
        sensor s ON r.idsensor = s.idsensor
    JOIN 
        trituradora t ON s.idsensor = t.idsensor;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al hacer la consulta:', err);
      return res.status(500).json({ error: 'Hubo un error al consultar los datos' });
    }
    res.json(results); // Retorna los resultados de la consulta
  });
});


// Ruta POST para registrar un nuevo usuario
app.post('/registro', (req, res) => {
  const { email, contrasena } = req.body; // Ya no esperamos tipo_usuario_id

  // Validación de los datos
  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Validar formato del correo electrónico (puedes usar una expresión regular o una librería)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Correo electrónico no válido' });
  }

  // Validar la contraseña (puedes usar una expresión regular o validación propia)
  if (contrasena.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Verificar si el email ya existe en la base de datos
  const checkEmailQuery = 'SELECT * FROM usuario WHERE email = ?';
  connection.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar el email:', err);
      return res.status(500).json({ error: 'Hubo un error al verificar el email' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Asignar tipo_usuario_id como 1 (valor predeterminado)
    const tipo_usuario_id = 1;

    // Insertar el nuevo usuario en la base de datos (sin encriptar la contraseña)
    const insertQuery = `
      INSERT INTO usuario (tipo_usuario_id, email, contrasena, estado)
      VALUES (?, ?, ?, 'HABILITADO');
    `;
    connection.query(insertQuery, [tipo_usuario_id, email, contrasena], (err, result) => {
      if (err) {
        console.error('Error al insertar el usuario:', err);
        return res.status(500).json({ error: 'Hubo un error al registrar el usuario' });
      }

      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, contrasena } = req.body;

  // Validación de los datos de entrada
  if (!email || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  // Verificar si el email existe en la base de datos
  const checkEmailQuery = 'SELECT * FROM usuario WHERE email = ?';
  connection.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error('Error al verificar el email:', err);
      return res.status(500).json({ error: 'Hubo un error al verificar el email' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const user = results[0];

    // Verificar si el tipo de usuario es 1 o 2 (si es necesario)
    if (user.tipo_usuario_id !== 1 && user.tipo_usuario_id !== 2) {
      return res.status(400).json({ error: 'El tipo de usuario no es válido' });
    }

    // Verificar si la contraseña es correcta
    if (contrasena !== user.contrasena) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // Si la contraseña es correcta, devolver un mensaje de éxito
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      userId: user.idusuario,
      tipo_usuario_id: user.tipo_usuario_id,
    });
  });
});


// Configurar el puerto en el que se va a ejecutar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});
