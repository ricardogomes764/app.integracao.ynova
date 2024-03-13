import { prisma } from '../../../database/prismaClient.js';
import { ModelCustomer } from '../../../models/customers.js';
import { ModelVehicle } from '../../../models/vehicles.js';

export const createNewVehicles = async (dataParsed) => {
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();
    let modelVehicle = new ModelVehicle();
    let newVehicle = [];

    const filterVehicles = async (index) => {
        if (!dataParsed[index]) return;

        const id = await modelVehicle.getVehicleIDByLicensePlate(
            dataParsed[index].placa
        );

        if (!id) {
            let vehicle = {
                ativo: true,
                placa: dataParsed[index].placa,
                renavam: dataParsed[index].renavam,
                dt_criacao: dataParsed[index].dt_criacao,
                dt_atualizacao: dataParsed[index].dt_atualizacao,
            };

            newVehicle.push({
                ...vehicle,
            });

            if (newVehicle.length >= 50) {
                console.log(`Criando ${newVehicle.length} veículos`);
                await prisma.veiculo.createMany({
                    data: newVehicle,
                    skipDuplicates: true,
                });
                newVehicle = [];
            }

            vehicle = null;
        }

        await filterVehicles(index + 1);
    };

    await filterVehicles(0);

    if (newVehicle.length > 0) {
        try {
            console.log(`Criando ${newVehicle.length} veículos`);
            await prisma.veiculo.createMany({
                data: newVehicle,
                skipDuplicates: true,
            });
        } catch (error) {
            try {
                await prisma.reg_temporarios_veiculos.createMany({
                    data: newVehicle.map((vehicle) => ({
                        placa: vehicle.placa,
                        idcliente: Number(ID_CUSTOMER),
                        tipo_erro: 'ERRO_VEHICLE_CREATE',
                        message: JSON.stringify(error),
                        dados: JSON.stringify(vehicle),
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

    newVehicle = null;
    modelVehicle = null;
};
