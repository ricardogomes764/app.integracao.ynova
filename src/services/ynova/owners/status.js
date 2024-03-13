import { enum_status_proprietario } from '@prisma/client';
import { prisma } from '../../../database/prismaClient.js';
import { ModelOwner } from '../../../models/owners.js';
import { ModelCustomer } from '../../../models/customers.js';

const getStatusOwner = (value) => {
    switch (value) {
        case 2:
            return enum_status_proprietario.Bloqueado;
        case 1:
            return enum_status_proprietario.Vencido;
        case 0:
            return enum_status_proprietario.Ativo;
        default:
            return enum_status_proprietario.Ativo;
    }
};

export const refreshStatusOwner = async (dataParsed) => {
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    let modelOwner = new ModelOwner();

    const loopOwner = async (index) => {
        if (!dataParsed[index]) return;

        const idproprietario = await modelOwner.getOwnerIDByCpfOrCnpj(
            dataParsed[index].cpf_cnpj_prop
        );

        if (!idproprietario)
            throw new Error(
                `Proprietário não encontrado ${dataParsed[index].cpf_cnpj_prop}`
            );

        let newStatusOwner = {
            idproprietario,
            idcliente: Number(ID_CUSTOMER),
            numero_cliente: dataParsed[index].id_prop_ynova,
            dt_cliente: dataParsed[index].dt_cliente,
            dt_atualizacao: dataParsed[index].dt_atualizacao,
            dt_criacao: dataParsed[index].dt_criacao,
            status_proprietario: getStatusOwner(dataParsed[index].status),
        };

        console.log(
            'Status proprietário atualizado idproprietario:',
            newStatusOwner.idproprietario
        );

        await prisma.status_proprietarios.upsert({
            where: {
                idproprietario_idcliente: {
                    idproprietario: newStatusOwner.idproprietario,
                    idcliente: newStatusOwner.idcliente,
                },
            },
            update: {
                ...newStatusOwner,
            },
            create: {
                ...newStatusOwner,
            },
        });

        newStatusOwner = null;
        await loopOwner(index + 1);
    };

    await loopOwner(0);
    modelOwner = null;
};
