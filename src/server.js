const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "45350299",
    database: "saillen",
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ruta para obtener datos de fichas, materiales y proporciones
app.get("/get_data", (req, res) => {
    const ficha = req.query.ficha;
    if (!ficha) {
        res.status(400).json({ error: "Se requiere un valor de ficha" });
        return;
    }

    const query = `
    SELECT 
    f.*, 
    m.materialesAlter1, 
    m.materialesAlter2,
    m.materialesAlter3,
    m.materialesAlter4,
    m.materialesAlter5,
    m.materialesAlter6,
    m.materialesAlter7,
    m.materialesAlter8,
    m.materialesAlter9,
    m.materialesAlter10,
    m.materialesAlter11,
    m.materialesAlter12,
    p.proporcion1, 
    p.proporcion2,
    p.proporcion3,
    p.proporcion4,
    p.proporcion5,
    p.proporcion6,
    p.proporcion7,
    p.proporcion8,
    p.proporcion9,
    p.proporcion10,
    p.proporcion11,
    p.proporcion12
FROM 
    fichas f
LEFT JOIN 
    materiales m ON f.id = m.id_fichas
LEFT JOIN 
    proporciones p ON m.id = p.id_materiales
WHERE 
    f.ficha = ?;`;

    connection.query(query, [ficha], (err, results) => {
        if (err) {
            console.error("Error al obtener los datos:", err);
            res.status(500).json({ error: "Error al obtener los datos de la base de datos" });
            return;
        }

        if (results.length > 0) {
            const fichaData = results[0];
            res.json([fichaData]);
        } else {
            res.json([]);
        }
    });
});

// Ruta para guardar fichas
app.post("/save_ficha", (req, res) => {
    const formData = req.body;

    const query = `
        INSERT INTO fichas (ficha, tipo, medidas, caracteristicas, prensa, presion, pesoPiso, pesoPared, pesoTotal, largo, altura, ancho, diametroRecorte, buje, CODIGO, pesoRecorte, tratamientoTermico, escotes1, escotes2)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    connection.query(
        query,
        [
            formData.ficha,
            formData.tipo,
            formData.medidas,
            formData.caracteristicas,
            formData.prensa,
            formData.presion,
            formData.pesoPiso,
            formData.pesoPared,
            formData.pesoTotal,
            formData.largo,
            formData.altura,
            formData.ancho,
            formData.diametroRecorte,
            formData.buje,
            formData.CODIGO,
            formData.pesoRecorte,
            formData.tratamientoTermico,
            formData.escote1,
            formData.escote2
        ],
        (err, fichaResults) => {
            if (err) {
                console.error("Error al guardar la ficha:", err);
                res.status(500).json({ error: "Error al guardar la ficha en la base de datos" });
                return;
            }
            res.json({ message: "Ficha guardada exitosamente" });
        }
    );
});

// Ruta para guardar materiales
app.post("/save_materiales", (req, res) => {
    const formData = req.body;

    // Obtener el ID de la última ficha insertada
    connection.query("SELECT MAX(id) AS last_id FROM fichas", (err, result) => {
        if (err) {
            console.error("Error al obtener el último ID", err);
            res.status(500).json({ error: "Error al obtener el último ID" });
            return;
        }

        const lastFichaId = result[0].last_id;

        // Consulta para insertar los materiales y enlazarlos con la ficha
        const materialesQuery = `
            INSERT INTO materiales (id_fichas, materialesAlter1, materialesAlter2, materialesAlter3, materialesAlter4, materialesAlter5,
                materialesAlter6, materialesAlter7, materialesAlter8, materialesAlter9, materialesAlter10, materialesAlter11, materialesAlter12)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
            materialesQuery,
            [
                lastFichaId,
                formData.materialesAlter1,
                formData.materialesAlter2,
                formData.materialesAlter3,
                formData.materialesAlter4,
                formData.materialesAlter5,
                formData.materialesAlter6,
                formData.materialesAlter7,
                formData.materialesAlter8,
                formData.materialesAlter9,
                formData.materialesAlter10,
                formData.materialesAlter11,
                formData.materialesAlter12,
            ],
            (err, materialsResult) => {
                if (err) {
                    console.error("Error al guardar los materiales:", err);
                    res.status(500).json({ error: "Error al guardar los materiales en la base de datos" });
                    return;
                }
                res.json({ message: "Materiales guardados y enlazados con la ficha" });
            }
        );
    });
});

// Ruta para guardar proporciones
app.post("/save_proporciones", (req, res) => {
    const formData = req.body;

    // Obtener el ID de los últimos materiales que insertamos
    connection.query("SELECT MAX(id) AS last_id FROM materiales", (err, result) => {
        if (err) {
            console.error("Error al obtener el último ID de materiales", err);
            res.status(500).json({ error: "Error al obtener el último ID de materiales" });
            return;
        }
        const lastMaterialsId = result[0].last_id;

        // Consulta para insertar las proporciones y enlazarlas con los materiales
        const proporcionesQuery = `
            INSERT INTO proporciones (id_materiales, proporcion1, proporcion2, proporcion3, proporcion4, proporcion5, proporcion6, proporcion7, proporcion8, proporcion9, proporcion10, proporcion11, proporcion12)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        connection.query(
            proporcionesQuery,
            [
                lastMaterialsId, // Utilizamos el ID de materiales obtenido anteriormente
                formData.proporcion1,
                formData.proporcion2,
                formData.proporcion3,
                formData.proporcion4,
                formData.proporcion5,
                formData.proporcion6,
                formData.proporcion7,
                formData.proporcion8,
                formData.proporcion9,
                formData.proporcion10,
                formData.proporcion11,
                formData.proporcion12
            ],
            (err, proportionsResult) => {
                if (err) {
                    console.error("Error al guardar las proporciones:", err);
                    res.status(500).json({ error: "Error al guardar las proporciones en la base de datos" });
                    return;
                }
                res.json({ message: "Proporciones guardadas y enlazadas con los materiales" });
            }
        );
    });
});

app.use(cors());

app.get('/buscar', (req, res) => {
    const medidas = req.query.medidas;

    if (!medidas) {
        res.status(400).json({ error: 'Se requieren las medidas' });
        return;
    }

    // Consulta SQL para buscar datos por medidas
    const query = `
        SELECT fichas.*, 
        materiales.materialesAlter1, 
        materiales.materialesAlter2,
        materiales.materialesAlter3,
        materiales.materialesAlter4,
        materiales.materialesAlter5,
        materiales.materialesAlter6,
        materiales.materialesAlter7,
        materiales.materialesAlter8,
        materiales.materialesAlter9,
        materiales.materialesAlter10,
        materiales.materialesAlter11,
        materiales.materialesAlter12,
        proporciones.proporcion1, 
        proporciones.proporcion2,
        proporciones.proporcion3,
        proporciones.proporcion4,
        proporciones.proporcion5,
        proporciones.proporcion6,
        proporciones.proporcion7,
        proporciones.proporcion8,
        proporciones.proporcion9,
        proporciones.proporcion10,
        proporciones.proporcion11,
        proporciones.proporcion12
        FROM fichas
        LEFT JOIN materiales ON fichas.id = materiales.id_fichas
        LEFT JOIN proporciones ON materiales.id = proporciones.id_materiales
        WHERE fichas.medidas = ?`;

    connection.query(query, [medidas], (err, results) => {
        if (err) {
            console.error('Error al obtener los datos:', err);
            res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
            return;
        }

        if (results.length > 0) {
            const medidasData = results[0];
            res.json([medidasData]);
        } else {
            res.json([]);
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});