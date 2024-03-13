import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data.map((item) => {
        return {
            cpf_cnpj_prop: item.cpfcnpj.replace(/\D/g, ''),
            id_prop_ynova: null,
            nome_prop: item.nome,
            status: Number(item.liberado),
            antt_prop: item.rntrc,
            dt_cliente: new Date(item.datahora),
            dt_criacao: new Date(),
            dt_atualizacao: new Date(),
        };
    });
};
