const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3001;
const SECRET_KEY = "scçajvwve9wg58edofergihwefipehoufewhfueqouwgfqouwueqoebqowdfrus";

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 3002 });

let fivemSocket = null;
let webClients = [];

function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return null;
    }
}

wss.on("connection", (ws) => {
    console.log("Novo cliente conectado!");

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        const decoded = verifyToken(data.token);
        if (!decoded) {
            ws.send(JSON.stringify({ error: "Autenticação falhou." }));
            ws.close();
            return;
        }

        if (data.type === "fivem") {
            fivemSocket = ws;
            console.log("FiveM conectado!");
        } else if (data.type === "web") {
            webClients.push(ws);
            console.log("Web conectada!");
        }

        if (data.target === "web" && webClients.length > 0) {
            webClients.forEach(client => client.send(JSON.stringify(data)));
        }

        if (data.target === "fivem" && fivemSocket) {
            fivemSocket.send(JSON.stringify(data));
        }
    });

    ws.on("close", () => {
        console.log("Cliente desconectado!");
        webClients = webClients.filter(client => client !== ws);
        if (ws === fivemSocket) {
            fivemSocket = null;
        }
    });
});

app.post("/login", (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Nome de usuário necessário" });

    const token = jwt.sign({ id: username, role: "vip" }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

app.get("/", (req, res) => {
    res.send("Acho que... não devias estar aqui!");
});

app.listen(port, () => {
    console.log(`API HTTP a correr na porta ${port}`);
    console.log(`Made with Love by AfonsoQueiroz`);
});
