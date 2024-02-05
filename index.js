/**
* @fileoverview Bot de Whatsapp, script para cliente API y Whatsapp
*
* @version 1.0
*
* @author automatizacion
* @copyright abasa
*
* History
* v1.0 – Creacion de Servidor API y espera de mensajes atravez del cliente de whatsapp
* ----
* 
*/

/** @const Client, LocalAuth, MessageMedia  constantentes de librerias importadas */
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); //npm install whatsapp-web.js

const qrcode = require('qrcode-terminal');//npm install qrcode-terminal
const mysql = require('mysql');
const express = require('express');//npm install express
const dotenv = require('dotenv');
const fs = require('fs');

const { createCanvas, loadImage } = require('canvas');
const Chart = require('chart.js');
/**
 * instancia de variables de entorno
 * @params {dotenv} config
 */
dotenv.config();

/**
 * instancia de variables de entorno
 * @params {express} express
 */
const app = express();
const port = 3000;

/**
 * @constructor
 * instancia de rama de conexion a la base de datos.
*/
const db = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER1,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const client = new Client({
    authStrategy: new LocalAuth()
});

/**
 * instancia de cliente web, solicitando el QR para su escaneo
 * @param qr
 */
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanear el código QR con la aplicación móvil de WhatsApp');
});

/**
 * inicializacion de cliente web
 * @param ready
 */
client.on('ready', () => {
    console.log('Cliente listo');
});

/**
 * inicializacion de conexion base de datos
 * @param err
 */
db.getConnection((err) => {
    if (err) {
        throw err;
    }
    console.log('Conectado a la base de datos...');
});

/**
 * inicializacion de cliente web
 */
client.initialize();

/**

 */

/** 
 * creacion de objeto de presentacion de L2 (SKU)
 * @constructor 
 * @var SKUL2
 */
var SKUL2 = {
    /**
     * Etiqueta de presentaciones segun SKU
     * @type {number}
     */
    1: "CC194",
    2: "CC354",
    3: "CC500",
    4: "FN194",
    5: "FN354",
    6: "Sprite354",
    7: "Sprite192",
    8: "Fresca354",
    9: "Shangrila"
};

/**
 * creacion de objeto de presentacion de L3 (SKU)
 * @var SKUL3
 */

var SKUL3 = {
    1: "CC600",
    2: "CC1500",
    3: "CC2000",
    4: "CC2500",
    5: "CC3000",
    6: "CC355",
    7: "DS1000",
    8: "",
    9: "",
    10: "",
    11: "",
    12: "CC450",
    13: "FN355",
    14: "FU355",
    15: "DS600",
    16: "FN600",
    17: "FU600",
    18: "",
    19: "CZ600",
    20: "CZ355"
};

/**
 * creacion de objeto de cajas por tarimas de L3
 * @var CajasTarimasL3
 */
var CajasTarimasL3 = {
    1: 120,
    2: 110,
    3: 80,
    4: 60,
    5: 80,
    6: 198,
    7: 168,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 154,
    13: 198,
    14: 198,
    15: 132,
    16: 120,
    17: 120,
    18: 0,
    19: 120,
    20: 335
};

/**
 * creacion de objeto de cajas teoricas de eficiencia de L3
 * @var CajasTeoricasL3
 */
var CajasTeoricasL3 = {
    1: 2900,
    2: 3250,
    3: 3000,
    4: 2400,
    5: 3000,
    6: 2900,
    7: 0,
    8: 0,
    9: 0,
    10: 0,
    11: 0,
    12: 2900,
    13: 2900,
    14: 2900,
    15: 2250,
    16: 2900,
    17: 2900,
    18: 0,
    19: 2900,
    20: 2900,
};

function calculoeficiencia() {
    console.log(eficiencia)
    return eficiencia;
}

/**
 * cliente de whatsapp escuchando la clave mensaje
 * @param message
 * @param {message} - objeto tipo WaWEBJS - este nos retorna los datos cuando se recibe un mensaje con las caracteristicas que requerimos
 * @description cliente de whatsapp escuchando en caso de recibir un mensaje.
 */
client.on('message', async (message) => {
    if (message.from == process.env.IDGOUPAUTO || message.from == process.env.IDHOST) {
        if (message.body == '/id') {
            client.sendMessage(process.env.IDHOST, message.from);
        } else if (message.body == '/GraficaL3') {
            message.reply('Generando grafica de L3');
            const sql = 'SELECT * FROM (SELECT * FROM abasa.`botellas producidas` ORDER BY id DESC LIMIT 60) AS subconsulta ORDER BY id ASC;';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        const DatosL3 = results.map((entry) => {
                            return entry.BPL3;
                        });
                        const Hora = results.map((entry) => {
                            return entry.Hora;
                        });

                        const canvas = createCanvas(800, 400);
                        const ctx = canvas.getContext('2d');

                        const chartConfig = {
                            type: 'line',
                            data: {
                                labels: Hora,
                                datasets: [{
                                    label: 'Botellas producidas L3',
                                    data: DatosL3,
                                    borderColor: 'rgb(244, 0, 0)',
                                    borderWidth: 2,
                                    fill: false,
                                }],
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: false
                                    }
                                }
                            }
                        };

                        const chart = new Chart(ctx, chartConfig);

                        const imagePath = './media/GrapL3.png';
                        const output = fs.createWriteStream(imagePath);
                        const stream = canvas.createPNGStream();

                        stream.pipe(output);
                        output.on('finish', () => {
                            const grafica = MessageMedia.fromFilePath('./media/GrapL3.png');
                            client.sendMessage(message.from, grafica, { caption: "Grafica actual de L3" });
                        });
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/GraficaL2') {

            message.reply('Generando grafica de L2');
            const sql = 'SELECT * FROM (SELECT * FROM abasa.`botellas producidas` ORDER BY id DESC LIMIT 60) AS subconsulta ORDER BY id ASC;';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        const Hora = results.map((entry) => {
                            return entry.Hora;
                        });
                        const DatosL2 = results.map((entry) => {
                            return entry.BPL2;
                        });
                        const canvas = createCanvas(800, 400);
                        const ctx = canvas.getContext('2d');

                        const chartConfig = {
                            type: 'line',
                            data: {
                                labels: Hora,
                                datasets: [{
                                    label: 'Botellas producidas L2',
                                    data: DatosL2,
                                    borderColor: 'rgb(244, 0, 0)',
                                    borderWidth: 2,
                                    fill: false,
                                }],
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: false
                                    }
                                }
                            }
                        };

                        const chart = new Chart(ctx, chartConfig);

                        const imagePath = './media/GrapL2.png';
                        const output = fs.createWriteStream(imagePath);
                        const stream = canvas.createPNGStream();

                        stream.pipe(output);
                        output.on('finish', () => {
                            const grafica = MessageMedia.fromFilePath('./media/GrapL2.png');
                            client.sendMessage(message.from, grafica, { caption: "Grafica actual de L2" });
                        });
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/EficienciaL3') {
            const consultaDataPLC = 'SELECT orden_produccion_llenadora3, L3_Pallet_C_Tar_Produccion FROM dataplc ORDER BY IDPLC DESC LIMIT 1';
            let NumerPresentacionL3;
            let eficiencia;
            let NoPaletActual;

            db.query(consultaDataPLC, (error, results) => {
                if (error) throw error
                else {
                    NumerPresentacionL3 = results[0].orden_produccion_llenadora3;
                    noTarimasTotalHoraActual = results[0].L3_Pallet_C_Tar_Produccion;
                }
            }
            );
            const consulta = 'SELECT TarimasTotal, EficienciaAcumulada, Intervalo, Hora FROM eficiencial3 ORDER BY id DESC LIMIT 1';
            db.query(consulta, (error, results) => {
                if (error) throw error
                else {
                    let noTarimasTotalHoraAnt = results[0].TarimasTotal;
                    let tarimasHoraActual = (noTarimasTotalHoraActual - noTarimasTotalHoraAnt);
                    console.log(noTarimasTotalHoraAnt, noTarimasTotalHoraActual);
                    let cajasHoraActual = tarimasHoraActual * CajasTarimasL3[NumerPresentacionL3];
                    console.log(tarimasHoraActual, CajasTarimasL3[NumerPresentacionL3]);
                    let efHoraActual = (cajasHoraActual / CajasTeoricasL3[NumerPresentacionL3]) * 100;
                    console.log(efHoraActual);
                    let eAcumAnterior = results[0].EficienciaAcumulada;
                    let intervaloAnterior = results[0].Intervalo;
                    let eHoraAnterior = results[0].Hora;
                    let intervaloActual = intervaloAnterior + 1;
                    eficiencia = (eAcumAnterior * intervaloAnterior + efHoraActual) / intervaloActual;
                    console.log(eficiencia)
                    message.reply(`En linea 3 la eficiencia por hora actual es el ${efHoraActual} y la eficiencia acumulada Actual es el ${eficiencia}%`);
                }
            }
            );
        } else if (message.body == '/PresentacionL3') {
            const sql = 'SELECT orden_produccion_llenadora3 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].orden_produccion_llenadora3
                        message.reply(`La presentacion actual en L3 es ${SKUL3[val]}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/PresentacionL2') {
            const sql = 'SELECT orden_produccion_llenadora2 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].orden_produccion_llenadora2
                        message.reply(`La presentacion actual en L2 es ${SKUL2[val]}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/VelocidadRealNominalL3') {
            const sql = 'SELECT velocidad_real_llenadora3, velocidad_nominal_llenadora3 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].velocidad_real_llenadora3
                        let val2 = results[0].velocidad_nominal_llenadora3
                        message.reply(`La velocidad real/nominal de la llenadora L3 es ${val}/${val2} BPM`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/VelocidadRealL3') {
            const sql = 'SELECT velocidad_real_llenadora3 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].velocidad_real_llenadora3
                        message.reply(`La velocidad real de la llenadora L3 es ${val} BPM`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/VelocidadNominalL3') {
            const sql = 'SELECT velocidad_real_llenadora3, velocidad_nominal_llenadora3 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val2 = results[0].velocidad_nominal_llenadora3
                        message.reply(`La velocidad nominal de la llenadora L3 es ${val2} BPM`);
                    }
                }
                );
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/TarimasTerminadasL3') {
            const sql = 'SELECT L3_Pallet_C_Tar_Produccion FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].L3_Pallet_C_Tar_Produccion
                        message.reply(`Numero de tarimas actuales en L3 ${val}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/BotellasProcesadasL3') {
            const sql = 'SELECT total_llenadora3 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].total_llenadora3
                        message.reply(`Numero de botellas procesadas en L3 ${val}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        }
        //Linea 2
        else if (message.body == '/VelocidadRealNominalL2') {
            const sql = 'SELECT velocidad_real_llenadora2, velocidad_nominal_llenadora2 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].velocidad_real_llenadora2
                        let val2 = results[0].velocidad_nominal_llenadora2
                        message.reply(`La velocidad real/nominal de la llenadora L2 es ${val}/${val2} BPM`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/VelocidadRealL2') {
            const sql = 'SELECT velocidad_real_llenadora2 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].velocidad_real_llenadora2
                        message.reply(`La velocidad real de la llenadora L2 es ${val} BPM`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/VelocidadNominalL2') {
            const sql = 'SELECT velocidad_nominal_llenadora2 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val2 = results[0].velocidad_nominal_llenadora2
                        message.reply(`La velocidad nominal de la llenadora L2 es ${val2} BPM`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/TarimasTerminadasL2') {
            const sql = 'SELECT L3_Pallet_C_Tar_Produccion FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = "(No hay conexion ethernet al PLC)"
                        message.reply(`Numero de tarimas actuales en L2 ${val}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body == '/BotellasProcesadasL2') {
            const sql = 'SELECT total_llenadora2 FROM dataplc LIMIT 1';
            try {
                db.query(sql, function (error, results) {
                    if (error) throw error
                    else {
                        let val = results[0].total_llenadora2
                        message.reply(`Numero de botellas procesadas en L2 ${val}`);
                    }
                });
            } catch (err) {
                console.log('Error al obtener los datos ' + err);
            }
        } else if (message.body.includes("/")) {
            message.reply(`El parametro de consulta no existe, porfavor ingrese uno de los siguentes segun lo que se necesite consultar
Linea 3
/VelocidadRealNominalL3
/VelocidadRealL3
/VelocidadNominalL3
/TarimasTerminadasL3
/BotellasProcesadasL3
/PresentacionL3
/EficienciaL3
/GraficaL3

Linea 2
/VelocidadRealNominalL2
/VelocidadRealL2
/VelocidadNominalL2
/TarimasTerminadasL2
/BotellasProcesadasL2
/PresentacionL2
/GraficaL2
`);
        }
    }

}
);

/**
 * API escuchando en direccion /notificacion
 * @param {estado} - /notificacion la cual nos envia un parametro para realizar la notificacion en el grupo
 * @param req - objeto request que se recibe desde la API
 * @param res
 */
app.get('/notificacion', (req, res) => {
    const estado = req.query.estado;
    res.json({ message: `valor de estado ${estado}` });
    if (estado == 1) {
        const sql = 'SELECT velocidad_real_llenadora3 FROM dataplc LIMIT 1';
        try {
            db.query(sql, function (error, results) {
                if (error) throw error
                else {
                    let val = results[0].velocidad_real_llenadora3
                    if (val <= 1) {
                        client.sendMessage(process.env.IDGOUPAUTO, `3️⃣❗ *Paro en linea 3, bajo velocidad a ${val} BPM* ❗`);
                    }
                    //message.reply(`La velocidad real de la llenadora L3 es ${val} BPM`);
                }
            });
        } catch (err) {
            console.log('Error al obtener los datos ' + err);
        }
    } else if (estado == 4) {
        const sql = 'SELECT velocidad_real_llenadora3 FROM dataplc LIMIT 1';
        try {
            db.query(sql, function (error, results) {
                if (error) throw error
                else {
                    let val = results[0].velocidad_real_llenadora3
                    if (val <= 270) {
                        client.sendMessage(process.env.IDGOUPAUTO, `3️⃣⚠️Linea 3 bajo velocidad de produccion a ${val} BPM⚠️`);
                    }
                    //message.reply(`La velocidad real de la llenadora L3 es ${val} BPM`);
                }
            });
        } catch (err) {
            console.log('Error al obtener los datos ' + err);
        }
    } else if (estado == 3) {
        const sql = 'SELECT velocidad_real_llenadora2 FROM dataplc LIMIT 1';
        try {
            db.query(sql, function (error, results) {
                if (error) throw error
                else {
                    let val = results[0].velocidad_real_llenadora2
                    if (val <= 1) {
                        client.sendMessage(process.env.IDGOUPAUTO, `2️⃣❗ *Paro en linea 2, bajo velocidad a ${val} BPM* ❗`);
                    }
                }
            });
        } catch (err) {
            console.log('Error al obtener los datos ' + err);
        }
    } else if (estado == 2) {
        const sql = 'SELECT velocidad_real_llenadora2 FROM dataplc LIMIT 1';
        try {
            db.query(sql, function (error, results) {
                if (error) throw error
                else {
                    let val = results[0].velocidad_real_llenadora2;
                    if (val <= 100) {
                        client.sendMessage(process.env.IDGOUPAUTO, `2️⃣⚠️Linea 2 bajo velocidad de produccion a ${val} BPM⚠️`);
                    }
                }
            });
        } catch (err) {
            console.log('Error al obtener los datos ' + err);
        }
    }
});

/**
 * 
 * @param {*} sql - query SQL
 * @param {*} params - parametros para Query
 * @returns Promise((resolve, reject) - resultado de ejecucion
 */
function queryDB(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * inicializacion de API
 * @param port - puerto en la que se estara escuchando
 */
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});