import { prisma } from '../database/prismaClient.js';
import { StateTypes } from '../shared/stateTypes.js';
import { ModelCustomer } from './customers.js';
// import { getDateTimeNow } from "../services/utils/dateTime.js";

export class LogsIntegration {
    modelCustomer = new ModelCustomer();

    async findLastSync(table_name) {
        const lastSync = await prisma.IntegracaoYnova.findMany({
            where: {
                table_name,
                id_customer:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
                state: StateTypes.success,
            },
            orderBy: {
                last_sync: 'desc',
            },
        });

        if (lastSync?.length > 0) {
            return lastSync[0].last_sync;
        } else {
            return new Date(process.env.START_DATE);
        }
    }

    async createSync({ table_name, state }) {
        const date = await this.findLastSync(table_name);
        const currentDate = new Date();
        let last_sync = new Date(date.setDate(date.getDate() + 1));

        if (last_sync >= currentDate) last_sync = currentDate;

        const newSync = await prisma.IntegracaoYnova.create({
            data: {
                last_sync,
                id_customer:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
                table_name,
                state,
            },
        });

        return newSync.id;
    }

    async updateSync({ id, state }) {
        const updateSync = await prisma.IntegracaoYnova.update({
            where: {
                id,
            },
            data: {
                state,
            },
        });
        return updateSync;
    }
}
