import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data
        .map((item) => {
            return {
                id_veiculo_ynova: null,
                placa: item.placacavalo,
                renavam: item.renavamcavalo,
                status: Number(item.liberadoveic),
                dt_cliente: new Date(item.datahoraveic),
                dt_criacao: new Date(),
                dt_atualizacao: new Date(),
            };
        });
};
