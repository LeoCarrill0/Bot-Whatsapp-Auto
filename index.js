const { Client, LocalAuth } = require('whatsapp-web.js'); //npm install whatsapp-web.js

const qrcode = require('qrcode-terminal');//npm install qrcode-terminal

const express = require('express');//npm install express
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = 3000;

console.log(process.env.IDHOST)
console.log(process.env.IDGOUPAUTO)

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanear el código QR con la aplicación móvil de WhatsApp');
});

client.on('ready', () => {
    console.log('Cliente listo');
});

client.initialize();

client.on('message', async (message) => {
    if(message.body=='/id')
    {
        client.sendMessage(process.env.IDHOST, message.from)
    }
    
});

app.get('/notificacion', (req, res) => {
    const estado = req.query.estado;
    res.json({ message: `valor de estado ${estado}` });
    if(estado==1){
        client.sendMessage(process.env.IDGOUPAUTO, `prueba mensaje ${estado}`);
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});