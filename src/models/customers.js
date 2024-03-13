import { prisma } from '../database/prismaClient.js';

export class ModelCustomer {
    async getIDCustomerByCnpj(cnpj) {
        const customer =
            await prisma.$queryRaw`SELECT id from clientes WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = ${cnpj};`;

        return customer?.length > 0 ? customer[0].id : undefined;
    }
    async getIDCustomerByDefaultCnpj() {
        const customer =
            await prisma.$queryRaw`SELECT id from clientes WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = ${process.env.CNPJ_CUSTOMER};`;

        return customer?.length > 0 ? Number(customer[0].id) : undefined;
    }
}
