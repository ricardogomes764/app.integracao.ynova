import moment from 'moment';
import { TableTypes } from '../../shared/tableTypes.js';
import { apiYnova } from './api.js';

export const getYnovaData = async ({ tableType, lastSync, token }) => {
    let body;
    let ynovaEndpoint;
    let resultField;

    switch (tableType) {
        case TableTypes.motoristas:
            ynovaEndpoint = 'tflexconsultacontroller/motorista';
            resultField = 'motorista';
            break;
        case TableTypes.proprietarios:
            ynovaEndpoint = 'TFlexconsultaController/Proprietario';
            resultField = 'proprietario';
            break;
        case TableTypes.veiculos:
            ynovaEndpoint = 'TFlexconsultaController/Veiculo';
            resultField = 'composicao';
            break;
        case TableTypes.viagens:
            ynovaEndpoint = 'TFlexconsultaController/CTe';
            resultField = 'cte';
            break;
    }

    body = { token: token , datahora: moment(lastSync, 'DD/MM/YYYY').format('DD/MM/YYYY') };

    try {

        let data = [];

        const endpoint = `/${ynovaEndpoint}`;

        const getData = async () => {
            const response = await apiYnova.post(
                endpoint,
                body
            );
            console.log({
                endpoint,
                body  
            })

            if (response?.status != 200)
                throw new Error('API ynova with error');

            if (!response?.data?.[resultField]?.length > 0)
                return;

            data.push(...response?.data?.[resultField]);

            body = { ...body, pagina: body.pagina + 1 };
            return
        };

        await getData();

        console.log('datalength:', data.length);

        return data;
    } catch (error) {
        console.log(error);
    }
};
