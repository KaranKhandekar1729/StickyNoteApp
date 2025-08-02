const express = require('express');
const cors = require('cors');
const pool = require('./config/database.js'); // database connection

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===============================================
// API ROUTES
// ===============================================

// for fetching all notes
app.get('/api/notes', async (req, res) => {
    try {
        const [notes] = await pool.query("SELECT * FROM notes ORDER BY id");
        res.json(notes);
    } catch (error) {
        console.error("GET Error:", error);
        res.status(500).json({ message: 'Database error', details: error.message });
    }
});

// for creating a new note
app.post('/api/notes', async (req, res) => {
    try {
        const { text = 'New Note', pos_x = 20, pos_y = 20, color = '#F8B9D4' } = req.body;
        const sql = "INSERT INTO notes (text, pos_x, pos_y, color) VALUES (?, ?, ?, ?)";
        const [result] = await pool.query(sql, [text, pos_x, pos_y, color]);

        const [[newNote]] = await pool.query("SELECT * FROM notes WHERE id = ?", [result.insertId]);
        res.status(201).json(newNote);

    } catch (error) {
        console.error("POST Error:", error);
        res.status(500).json({
            message: 'DB error on POST',
            details: error.message,
            code: error.code
        });
    }
});

// for updating a note
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text, pos_x, pos_y, color } = req.body;

        const fields = [];
        const params = [];

        if (text !== undefined) {
            fields.push("text = ?");
            params.push(text);
        }
        if (pos_x !== undefined) {
            fields.push("pos_x = ?");
            params.push(pos_x);
        }
        if (pos_y !== undefined) {
            fields.push("pos_y = ?");
            params.push(pos_y);
        }
        if (color !== undefined) {
            fields.push("color = ?");
            params.push(color);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(id);
        const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`;
        await pool.query(sql, params);

        res.json({ message: "Note updated successfully" });
    } catch (error) {
        console.error("PUT Error:", error);
        res.status(500).json({ message: 'Database error', details: error.message });
    }
});

// for deleting a note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM notes WHERE id = ?", [id]);
        res.status(204).send();
    } catch (error) {
        console.error("DELETE Error:", error);
        res.status(500).json({ message: 'Database error', details: error.message });
    }
});

// start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});