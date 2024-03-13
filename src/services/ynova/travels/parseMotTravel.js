import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data.map((item) => {
        return {
            id_motorista_atua: null,
            nome_mot: item.nomemot,
            cpf_mot: item.cpfmot.replace(/\D/g, ''),
            cnh_mot: item.cnhmot,
            status: Number(item.liberadomot),
            dt_cliente: new Date(item.datahoramot),
            dt_criacao: new Date(),
            dt_atualizacao: new Date(),
        };
    });
};
