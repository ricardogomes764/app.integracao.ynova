import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data.map((item) => {
        return {
            id_motorista_atua: null,
            nome_mot: item.nomemot,
            cpf_mot: item.cPF.replace(/\D/g, ''),
            cnh_mot: item.cnh,
            status: Number(item.liberado),
            dt_cliente: new Date(item.datahora),
            dt_criacao: new Date(),
            dt_atualizacao: new Date(),
        };
    });
};
