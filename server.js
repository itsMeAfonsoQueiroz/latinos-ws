const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const wss = new WebSocket.Server({ port: 3002 });

let fivemSocket = null;
let webClients = [];

const AUTH_TOKENS = ["O5mjJtqYO9fFfbO2LrhB8ci7YvbOrfgGRDQdWp7Y8Jv6BytSgvtZv8mVUMTGFCgi", "v8c2KsiKaxQGSredCZ9R09OXdImUK6e4oSwofhthLw38fRXbrKQcUy8Xj638vxV3"];
// o primeiro é do web e o segundo é fivemad


wss.on("connection", (ws) => {
    console.log("Novo cliente conectado!");

    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        if (!data.token || !AUTH_TOKENS.includes(data.token)) {
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

app.get("/", (req, res) => {
    res.send("Acho que... não devias estar aqui!");
});

app.listen(port, () => {
    console.log(`API HTTP a correr na porta ${port}`);
    console.log(`Made with Love by AfonsoQueiroz`);
});
