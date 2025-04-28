const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'dbuser',
    password: 'dbpass',
    database: 'my_db'
});

// conecta com a database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

const app = express();
const PORT = 3000;

// Middlewares necessarios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <form action="/subscribe" method="POST">
            <input type="email" name="email" placeholder="Insira seu email" required>
            <button type="submit">Enviar</button>
        </form>
    `);
});

// Recebe o email
app.post('/contatos', (req, res) => {
    const email = req.body.email;

    const sql = 'INSERT INTO contatos (email) VALUES (?)';

    connection.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error saving email:', err);
            return res.status(500).json({
                success: false,
                message: 'Error saving email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email saved successfully'
        });
    });
});

// middleware que pega qualquer erro generico
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('there was an error!');
});

// inicia o servidor
app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server is Successfully Running, and App is listening on port " + PORT)
    } else {
        console.log("Error occurred, server can't start", error);
    }
});

// captura erros de conexao com a db
connection.on('error', (err) => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // Reconnect if connection is lost
        connection.connect();
    } else {
        throw err;
    }
});