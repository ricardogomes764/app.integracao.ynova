import { prisma } from '../database/prismaClient.js';
import { ModelCustomer } from './customers.js';

export class ModelTravel {
    modelCustomer = new ModelCustomer();

    async getTravelIDByCustomerNumber(numero_cliente) {
        const travel = await prisma.viagem.findMany({
            where: {
                numero_cliente,
                idcliente:
                    await this.modelCustomer.getIDCustomerByDefaultCnpj(),
            },
            take: 1,
        });

        return travel?.length > 0 ? travel[0].id : undefined;
    }
}
