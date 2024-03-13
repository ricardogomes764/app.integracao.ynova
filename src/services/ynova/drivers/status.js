import 'dotenv/config';
import { prisma } from '../../../database/prismaClient.js';
import { ModelDriver } from '../../../models/drivers.js';
import { enum_status_motorista } from '@prisma/client';
import { ModelCustomer } from '../../../models/customers.js';

const getStatusMotorista = (value) => {
    switch (value) {
        case 2:
            return enum_status_motorista.Bloqueado;
        case 1:
            return enum_status_motorista.Vencido;
        case 0:
            return enum_status_motorista.Ativo;
        default:
            return enum_status_motorista.Ativo;
    }
};

export const refreshStatusDriver = async (dataParsed) => {
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    let modelDriver = new ModelDriver();

    const loopDrivers = async (index) => {
        if (!dataParsed[index]) return;

        const idmotorista = await modelDriver.getDriverIDByCpf(
            dataParsed[index].cpf_mot
        );

        if (!idmotorista)
            throw new Error(
                `Motorista não encontrado ${dataParsed[index].cpf_mot}`
            );

        let newStatusDriver = {
            idmotorista,
            idcliente: Number(ID_CUSTOMER),
            numero_cliente: dataParsed[index].id_motorista_atua,
            dt_cliente: dataParsed[index].dt_cliente,
            dt_atualizacao: dataParsed[index].dt_atualizacao,
            dt_criacao: dataParsed[index].dt_criacao,
            status_motorista: getStatusMotorista(dataParsed[index].status),
        };

        console.log(
            'Status motorista atualizado idmotorista:',
            newStatusDriver.idmotorista
        );
        
        try {
            await prisma.status_motoristas.upsert({
                where: {
                    idmotorista_idcliente: {
                        idmotorista: newStatusDriver.idmotorista,
                        idcliente: newStatusDriver.idcliente,
                    },
                },
                update: {
                    ...newStatusDriver,
                },
                create: {
                    ...newStatusDriver,
                },
            });
        } catch (error) {
            console.log('error ao criar status:', error);
        }

        newStatusDriver = null;
        await loopDrivers(index + 1);
    };

    await loopDrivers(0);
    modelDriver = null;
};
