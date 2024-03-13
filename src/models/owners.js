import { prisma } from '../database/prismaClient.js';
import { getYnovaData } from '../services/ynova/api.data.js';
import { createNewOwners } from '../services/ynova/owners/create.js';
import { parseData } from '../services/ynova/owners/parse.js';
import { refreshStatusOwner } from '../services/ynova/owners/status.js';
import { TableTypes } from '../shared/tableTypes.js';
import { ModelCustomer } from './customers.js';

export class ModelOwner {
    modelCustomer = new ModelCustomer();

    async getOwnerIDByCpfOrCnpj(cpf_cnpj_prop) {
        let owner = await prisma.proprietario.findMany({
            where: {
                cpf_cnpj_prop,
            },
            take: 1,
        });

        return owner?.length > 0 ? owner[0].id : undefined;
    }

    async getStatusOwnersByIdProprietarioAndIdCliente(
        idproprietario,
        idcliente
    ) {
        const status_proprietario = await prisma.status_proprietarios.findMany({
            where: {
                idproprietario,
                idcliente,
            },
            take: 1,
        });

        return status_proprietario?.length > 0
            ? status_proprietario[0].id
            : undefined;
    }

    async getStatusOwnerByCustomerNumber(numero_cliente) {
        const status_proprietario = await prisma.status_proprietarios.findMany({
            where: {
                numero_cliente,
                idcliente:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
            },
        });

        if (!(status_proprietario?.length > 0)) {
            const data = await getYnovaData({
                tableType: TableTypes.proprietarios,
                id: numero_cliente,
            });
            const dataParsed = parseData(data);
            await createNewOwners([...dataParsed]);
            await refreshStatusOwner(dataParsed);
            return await this.getStatusOwnerByCustomerNumber(
                dataParsed[0]?.id_prop_atua
            );
        }

        return status_proprietario?.length > 0
            ? status_proprietario[0].idproprietario
            : undefined;
    }
}
