import 'dotenv/config';
import { prisma } from '../../../database/prismaClient.js';
import { ModelDriver } from '../../../models/drivers.js';
import { ModelCustomer } from '../../../models/customers.js';

export const createNewDriver = async (dataParsed) => {
    let modelDriver = new ModelDriver();
    let newDrivers = [];

    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    const filterDrivers = async (index) => {
        if (!dataParsed[index]) return;

        const id = await modelDriver.getDriverIDByCpf(
            dataParsed[index].cpf_mot
        );

        if (!id) {
            let driver = {
                nome_mot: dataParsed[index].nome_mot,
                cpf_mot: dataParsed[index].cpf_mot,
                cnh_mot: dataParsed[index].cnh_mot,
                dt_criacao: dataParsed[index].dt_criacao,
                dt_atualizacao: dataParsed[index].dt_atualizacao,
                ativo: true,
            };

            newDrivers.push({
                ...driver,
            });

            if (newDrivers.length >= 50) {
                await prisma.motorista.createMany({
                    data: newDrivers,
                    skipDuplicates: true,
                });
                newDrivers = [];
            }

            driver = null;
        }

        await filterDrivers(index + 1);
    };

    await filterDrivers(0);

    if (newDrivers.length > 0) {
        try {
            await prisma.motorista.createMany({
                data: newDrivers,
                skipDuplicates: true,
            });

            // console.log('motoristas criados', data);
        } catch (error) {
            try {
                await prisma.reg_temporarios_motoristas.createMany({
                    data: newDrivers.map((driver) => ({
                        cpf_mot: driver.cpf_mot,
                        idcliente: Number(ID_CUSTOMER),
                        tipo_erro: 'ERRO_DRIVER_CREATE',
                        message: JSON.stringify(error),
                        dados: JSON.stringify(driver),
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

    newDrivers = null;
    modelDriver = null;
};
