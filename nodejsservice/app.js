// Importar express
const express = require('express');

// Crear una aplicación express
const app = express();

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());
const cors = require('cors');
app.use(cors());



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


// Configurar el puerto en el que se va a ejecutar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API corriendo en http://0.0.0.0:${PORT}`);
});
