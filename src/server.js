import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import { TableTypes } from './shared/tableTypes.js';
import {
    dateLessThanNow,
    getDateTimeFromString,
} from './services/utils/dateTime.js';
import { ynovaServiceTravel } from './services/ynova/travels/index.js';
import { ynovaServiceVehicle } from './services/ynova/vehicles/index.js';
import { ynovaServiceDriver } from './services/ynova/drivers/index.js';
import { ynovaServiceOwner } from './services/ynova/owners/index.js';
import { getLastSync } from './services/ynova/logs.controller.js';

import cron from 'node-cron';
import { prisma } from './database/prismaClient.js';
import { getToken } from './services/ynova/api.authenticate.js';
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

let token;

const refreshInterval = '*/59 * * * *'; // ynovaliza a cada 59 minutos

const connectYnova = async () => {
    console.log('INICIO CRON')
    token = await getToken();

    const syncDriver = async () => {
        await ynovaServiceDriver({ token });

        const { lastSync } = await getLastSync(TableTypes.motoristas);

        if (dateLessThanNow({ lastSync })) await syncDriver();
    };
    await syncDriver();

    const syncOwner = async () => {
        await ynovaServiceOwner({ token });

        const { lastSync } = await getLastSync(TableTypes.proprietarios);

        if (dateLessThanNow({ lastSync })) await syncOwner();
    };
    await syncOwner();

    const syncVehicle = async () => {
        await ynovaServiceVehicle({ token });

        const { lastSync } = await getLastSync(TableTypes.veiculos);

        if (dateLessThanNow({ lastSync })) await syncVehicle();
    };
    await syncVehicle();

    const syncTravel = async () => {
        await ynovaServiceTravel({ token });

        const { lastSync } = await getLastSync(TableTypes.viagens);

        if (dateLessThanNow({ lastSync })) await syncTravel();
    };
    await syncTravel();

    console.log(' ');
    console.log('CRON FINALIZADA');
};

const task = cron.schedule(refreshInterval, async () => {
    await prisma.$connect();
    await connectYnova();
    await prisma.$disconnect();
});

app.listen(process.env.PORT, async () => {
    console.log(
        `App started on ${process.env.PORT} for customer Ynova 👍 `
    );

    // const teste = getDateTimeFromString('20/01/2021 13:34:02');
    // console.log(teste)

    token = await getToken();
    await prisma.$connect();
    await connectYnova();
    await prisma.$disconnect();

    task.start();
});
