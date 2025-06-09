import express from "express";
import cors from "cors";
import config from './configs/db-config.js';
import pkg from 'pg';
import { StatusCodes } from 'http-status-codes';

const { Client } = pkg;
const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());


const getClient = () => new Client(config);


app.get('/api/alumnos/', async (req, res) => {
    const client = getClient();
    await client.connect();

    try {
        const result = await client.query('SELECT * FROM alumnos');
        res.status(StatusCodes.OK).json(result.rows);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.end();
    }
});


app.get('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
        return res.status(StatusCodes.BAD_REQUEST).send("El ID debe ser numérico");
    }

    const client = getClient();
    await client.connect();

    try {
        const result = await client.query('SELECT * FROM alumnos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).send("No se encontró la provincia con ese ID");
        }
        res.status(StatusCodes.OK).json(result.rows[0]);
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.end();
    }
});

app.post('/api/alumnos/', async (req, res) => {
    const { nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;

    if (!nombre || nombre.length < 3) {
        return res.status(StatusCodes.BAD_REQUEST).send("El nombre debe tener al menos 3 letras");
    }

    const client = getClient();
    await client.connect();

    try {
        await client.query(`
            INSERT INTO alumnos (nombre, apellido, id_curso, fecha_nacimiento, hace_deportes)
            VALUES ($1, $2, $3, $4, $5)
        `, [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes]);

        res.status(StatusCodes.CREATED).send("Provincia creada correctamente");
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.end();
    }
});

app.put('/api/alumnos/', async (req, res) => {
    const { id, nombre, apellido, id_curso, fecha_nacimiento, hace_deportes } = req.body;

    if (!nombre || nombre.length < 3) {
        return res.status(StatusCodes.BAD_REQUEST).send("El nombre debe tener al menos 3 letras");
    }

    const client = getClient();
    await client.connect();

    try {
        const check = await client.query('SELECT * FROM alumnos WHERE id = $1', [id]);
        if (check.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).send("No existe la provincia con ese ID");
        }

        await client.query(`
            UPDATE alumnos SET nombre = $1, apellido = $2, id_curso = $3, fecha_nacimiento = $4, hace_deportes = $5
            WHERE id = $6
        `, [nombre, apellido, id_curso, fecha_nacimiento, hace_deportes, id]);

        res.status(StatusCodes.CREATED).send("Provincia actualizada");
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.end();
    }
});

app.delete('/api/alumnos/:id', async (req, res) => {
    const { id } = req.params;

    const client = getClient();
    await client.connect();

    try {
        const result = await client.query('DELETE FROM alumnos WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send("No se encontró la provincia con ese ID");
        }
        res.status(StatusCodes.OK).send("Provincia eliminada");
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    } finally {
        client.end();
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
