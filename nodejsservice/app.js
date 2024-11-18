// Importar express
const express = require('express');

// Crear una aplicación express
const app = express();

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());



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
app.get('/datos', (req, res) => {
  const query = `
    SELECT
      s.fecha_inicial,
      s.fecha_final,
      r.peso,
      t.nombre AS trituradora
    FROM
      sensor s
    JOIN
      resultado r ON s.idsensor = r.idsensor
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
app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
