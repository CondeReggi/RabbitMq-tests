require('dotenv').config()
const amqp = require('amqplib/callback_api');

const usuario = process.env.USER;
const password = process.env.PASSWORD;
const hostname = process.env.HOST;

amqp.connect(`amqp://${usuario}:${password}@${hostname}`, function (err, conn) {
    if (err) {
        console.log('Error al conectarse con rabbit', err);
    }

    conn.createChannel(function (error, channel) {
        if (error) {
            console.log('Error al crear channel en rabbit', error);
        } 

        let array_estaciones = process.env.ESTACIONES;
        let exchange = process.env.EXCHANGE;

        for (let estacion of array_estaciones.split(',')) {
            const queueDatosCaja = `DUCSA_DatosCajaQueue_${estacion}`;
            const queueResultadoPago = `DUCSA_ResultadoPagoQueue_${estacion}`;

            channel.deleteQueue(queueDatosCaja);
            channel.deleteQueue(queueResultadoPago);

            channel.assertQueue(queueDatosCaja, {
                durable: true,
                autoDelete: false
            });
            channel.bindQueue(queueDatosCaja, exchange, queueDatosCaja);
            channel.assertQueue(queueResultadoPago, {
                durable: true,
                autoDelete: false
            });
            channel.bindQueue(queueResultadoPago, exchange, queueResultadoPago);
        }
    });

    setTimeout(function () {
        conn.close();
    }, 10 * 1000);
});


