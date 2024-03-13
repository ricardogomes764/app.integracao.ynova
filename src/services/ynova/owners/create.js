import { prisma } from '../../../database/prismaClient.js';
import { ModelCustomer } from '../../../models/customers.js';
import { ModelOwner } from '../../../models/owners.js';

export const createNewOwners = async (dataParsed) => {
    let modelOwner = new ModelOwner();
    let newOwners = [];

    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    const filterOwners = async (index) => {
        if (!dataParsed[index]) return;

        const id = await modelOwner.getOwnerIDByCpfOrCnpj(
            dataParsed[index].cpf_cnpj_prop
        );

        if (!id) {
            let owner = {
                ativo: true,
                nome_prop: dataParsed[index].nome_prop,
                cpf_cnpj_prop: dataParsed[index].cpf_cnpj_prop,
                dt_criacao: dataParsed[index].dt_criacao,
                dt_atualizacao: dataParsed[index].dt_atualizacao,
                antt_prop: dataParsed[index].antt_prop,
            };

            newOwners.push({
                ...owner,
            });

            if (newOwners.length >= 50) {
                await prisma.proprietario.createMany({
                    data: newOwners,
                    skipDuplicates: true,
                });
                newOwners = [];
            }

            owner = null;
        }

        await filterOwners(index + 1);
    };

    await filterOwners(0);

    if (newOwners.length > 0) {
        try {
            await prisma.proprietario.createMany({
                data: newOwners,
                skipDuplicates: true,
            });
        } catch (error) {
            try {
                await prisma.reg_temporarios_proprietarios.createMany({
                    data: newOwners.map((owner) => ({
                        cpf_cnpj_prop: owner.cpf_cnpj_prop,
                        idcliente: Number(ID_CUSTOMER),
                        tipo_erro: 'ERRO_OWNER_CREATE',
                        message: JSON.stringify(error),
                        dados: JSON.stringify(owner),
                        dt_criacao: new Date(),
                        dt_atualizacao: new Date(),
                    })),
                    skipDuplicates: true,
                });
            } catch (error) {
                console.log(error);
            }
        }
    }

    newOwners = null;
    modelOwner = null;
};
