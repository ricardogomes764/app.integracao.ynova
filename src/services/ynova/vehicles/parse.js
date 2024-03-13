import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data
        .filter((item) => item.veiculos[0]?.placa && item)
        .map((item) => {
            return {
                id_veiculo_ynova: null,
                placa: item.veiculos[0]?.placa,
                renavam: item.veiculos[0]?.renavan,
                status: Number(item.liberado),
                dt_cliente: getDateTimeFromString(item.date_update),
                dt_criacao: new Date(),
                dt_atualizacao: new Date(),
            };
        });
};
