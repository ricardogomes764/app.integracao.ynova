import { prisma } from '../database/prismaClient.js';
import { getYnovaData } from '../services/ynova/api.data.js';
import { createNewDriver } from '../services/ynova/drivers/create.js';
import { parseData } from '../services/ynova/drivers/parse.js';
import { refreshStatusDriver } from '../services/ynova/drivers/status.js';
import { TableTypes } from '../shared/tableTypes.js';
import { ModelCustomer } from './customers.js';

export class ModelDriver {
    modelCustomer = new ModelCustomer();

    async getDriverIDByCpf(cpf_mot) {
        let driver = await prisma.motorista.findMany({
            where: {
                cpf_mot,
            },
            take: 1,
        });

        return driver?.length > 0 ? driver[0].id : undefined;
    }

    async getStatusDriversByIdMotoristaAndIdCliente(idmotorista, idcliente) {
        const status_motorista = await prisma.status_motoristas.findMany({
            where: {
                idmotorista,
                idcliente,
            },
            take: 1,
        });

        return status_motorista?.length > 0
            ? status_motorista[0].id
            : undefined;
    }

    async getStatusDriverByCustomerNumber(numero_cliente) {
        const status_motorista = await prisma.status_motoristas.findMany({
            where: {
                numero_cliente,
                idcliente:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
            },
        });

        if (!(status_motorista?.length > 0)) {
            const data = await getYnovaData({
                tableType: TableTypes.motoristas,
                id: numero_cliente,
            });
            const dataParsed = parseData(data);
            await createNewDriver([...dataParsed]);
            await refreshStatusDriver(dataParsed);
            return await this.getStatusDriverByCustomerNumber(
                dataParsed[0]?.id_motorista_atua
            );
        }

        return status_motorista?.length > 0
            ? status_motorista[0].idmotorista
            : undefined;
    }
}
