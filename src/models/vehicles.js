import { prisma } from '../database/prismaClient.js';
import { getYnovaData } from '../services/ynova/api.data.js';
import { createNewVehicles } from '../services/ynova/vehicles/create.js';
import { parseData } from '../services/ynova/vehicles/parse.js';
import { refreshStatusVehicle } from '../services/ynova/vehicles/status.js';
import { TableTypes } from '../shared/tableTypes.js';
import { ModelCustomer } from './customers.js';

export class ModelVehicle {
    modelCustomer = new ModelCustomer();

    async getVehicleIDByLicensePlate(placa) {
        const vehicle = await prisma.veiculo.findMany({
            where: {
                placa,
            },
            take: 1,
        });

        return vehicle?.length > 0 ? vehicle[0].id : undefined;
    }

    async getStatusVehiclesByIdVeiculoAndIdCliente(idveiculo, idcliente) {
        const status_veiculo = await prisma.status_veiculos.findMany({
            where: {
                idveiculo,
                idcliente,
            },
            take: 1,
        });

        return status_veiculo?.length > 0 ? status_veiculo[0].id : undefined;
    }

    async getStatusVehicleByCustomerNumber(numero_cliente) {
        const status_veiculo = await prisma.status_veiculos.findMany({
            where: {
                numero_cliente,
                idcliente:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
            },
            take: 1,
        });

        if (!(status_veiculo?.length > 0)) {
            console.log('************1************')
            console.log('************1************')
            const data = await getYnovaData({
                tableType: TableTypes.veiculos,
                id: numero_cliente,
            });
            const dataParsed = parseData(data);
            await createNewVehicles([...dataParsed]);
            await refreshStatusVehicle(dataParsed);
            return await this.getStatusVehicleByCustomerNumber(
                dataParsed[0]?.id_veiculo_atua
            );
        }

        return status_veiculo?.length > 0
            ? status_veiculo[0].idveiculo
            : undefined;
    }
}
