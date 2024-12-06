import express, { response } from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();

app.use(express.json());
app.use(cors());

const backu = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "backu",
});

const saltRounds = 10;

app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.json({ error: "Error hashing password" });

        const sql = "INSERT INTO accounts (username, email, password) VALUES (?)";
        const values = [username, email, hash];

        backu.query(sql, [values], (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ error: "Error inserting into database" });
            }

            return res.json({ message: "User registered successfully", result });
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM accounts WHERE email = ?";

    backu.query(sql, [email], (err, result) => {
        if (err) return res.json({ error: "Error accessing the database" });

        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, response) => {
                if (err) return res.json({ error: "Error comparing password" });

                if (response) {
                    return res.json({ status: "Success" });
                } else {
                    return res.json({ error: "Wrong password" });
                }
            });
        } else {
            return res.json({ error: "Email does not exist" }); 
        }
    });
});

app.listen(8001, () => {
    console.log("Server is listening on port 8001");
});