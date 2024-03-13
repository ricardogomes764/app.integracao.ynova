import { getDateTimeFromString } from '../../utils/dateTime.js';

export const parseData = (data) => {
    return data.map((item) => {
        return {
            cpf_cnpj_prop: item.cpfcnpjprop.replace(/\D/g, ''),
            id_prop_ynova: null,
            nome_prop: item.nomeprop,
            status: Number(item.liberadoprop),
            dt_cliente: new Date(item.datahoraprop),
            dt_criacao: new Date(),
            dt_atualizacao: new Date(),
        };
    });
};
