import 'dotenv/config';
import { prisma } from '../../../database/prismaClient.js';
import { enum_status_veiculo } from '@prisma/client';
import { ModelVehicle } from '../../../models/vehicles.js';
import { ModelCustomer } from '../../../models/customers.js';

const getStatusVehicle = (value) => {
    switch (value) {
        case 2:
            return enum_status_veiculo.Bloqueado;
        case 1:
            return enum_status_veiculo.Vencido;
        case 0:
            return enum_status_veiculo.Ativo;
        default:
            return enum_status_veiculo.Ativo;
    }
};

export const refreshStatusVehicle = async (dataParsed) => {
    let modelVehicle = new ModelVehicle();
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    const loopVehicle = async (index) => {
        if (!dataParsed[index]) return;

        const idveiculo = await modelVehicle.getVehicleIDByLicensePlate(
            dataParsed[index].placa
        );

        if (!idveiculo)
            throw new Error(
                `Veículo não encontrado ${dataParsed[index].placa}`
            );

        let newStatusVehicle = {
            idveiculo,
            idcliente: Number(ID_CUSTOMER),
            numero_cliente: dataParsed[index].id_veiculo_ynova,
            dt_cliente: dataParsed[index].dt_cliente,
            dt_atualizacao: dataParsed[index].dt_atualizacao,
            dt_criacao: dataParsed[index].dt_criacao,
            status_veiculo: getStatusVehicle(dataParsed[index].status),
        };

        console.log(
            'Status veículo atualizado idveiculo:',
            newStatusVehicle.idveiculo
        );

        await prisma.status_veiculos.upsert({
            where: {
                idveiculo_idcliente: {
                    idveiculo: newStatusVehicle.idveiculo,
                    idcliente: newStatusVehicle.idcliente,
                },
            },
            update: {
                ...newStatusVehicle,
            },
            create: {
                ...newStatusVehicle,
            },
        });

        newStatusVehicle = null;
        await loopVehicle(index + 1);
    };

    await loopVehicle(0);
    modelVehicle = null;
};
