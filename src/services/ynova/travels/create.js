import { prisma } from '../../../database/prismaClient.js';
import { ModelCustomer } from '../../../models/customers.js';
import { getLocalID } from '../../utils/dataLocalID.js';

export const createNewTravels = async (dataParsed) => {
    let newTravels = [];
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    const filterTravels = async (index) => {
        if (!dataParsed[index]) return;

        const { idmotorista, idproprietario, idveiculo, isValidData } =
            await getLocalID(dataParsed[index]);

        if (isValidData) {
            let travel = {
                idcliente: dataParsed[index].idcliente,
                numero_cliente: dataParsed[index].numero_cliente,
                dt_viagem: dataParsed[index].dt_viagem,
                mercadoria: dataParsed[index].mercadoria,
                cidade_origem: dataParsed[index].cidade_origem,
                cidade_destino: dataParsed[index].cidade_destino,
                carreta1: dataParsed[index].carreta1,
                carreta2: dataParsed[index].carreta2,
                carreta3: dataParsed[index].carreta3,
                idmotorista: Number(idmotorista),
                idproprietario: Number(idproprietario),
                idveiculo: Number(idveiculo),
                viagem_cancelado: dataParsed[index].viagem_cancelado,
                dt_cancelamento:
                    dataParsed[index]?.viagem_cancelado == 'S'
                        ? new Date()
                        : null,
                dt_cliente: dataParsed[index].dt_cliente,
                dt_criacao: dataParsed[index].dt_criacao,
                dt_atualizacao: dataParsed[index].dt_atualizacao,
            };

            newTravels.push({
                ...travel,
            });

            if (newTravels.length >= 50) {
                await prisma.viagem.createMany({
                    data: newTravels,
                    skipDuplicates: true,
                });
                newTravels = [];
            }
            travel = null;
        }

        await filterTravels(index + 1);
    };

    await filterTravels(0);

    if (newTravels.length > 0) {
        try {
            await prisma.viagem.createMany({
                data: newTravels,
                skipDuplicates: true,
            });
        } catch (error) {
            try {
                await prisma.reg_temporarios_viagens.createMany({
                    data: newTravels.map((travel) => ({
                        numero_cliente: travel.numero_cliente,
                        idcliente: Number(ID_CUSTOMER),
                        tipo_erro: 'ERRO_TRAVEL_CREATE',
                        message: JSON.stringify(error),
                        dados: JSON.stringify(travel),
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

    newTravels = null;
};
