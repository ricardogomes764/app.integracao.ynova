import { enum_viagem_cancelado } from '@prisma/client';
import { getDateTimeFromString } from '../../utils/dateTime.js';
import { ModelCustomer } from '../../../models/customers.js';

export const parseData = async (data) => {
    const modelCustomer = new ModelCustomer();
    const ID_CUSTOMER = await modelCustomer.getIDCustomerByDefaultCnpj();

    return data.map((item) => {
        return {
            idcliente: Number(ID_CUSTOMER),
            numero_cliente: item.codviagem.toString(),
            dt_viagem: new Date(item.data),
            mercadoria: item.mercadoria,
            cidade_origem: item.cidadeuforigem,
            cidade_destino: item.cidadeufdestino,
            carreta1: item?.placacarreta1,
            carreta2: item?.placacarreta2,
            carreta3: item?.placacarreta3,
            cpf_mot: item.cpfmot.replace(/\D/g, ''),
            cpf_cnpj_prop: item.cpfcnpjprop.replace(/\D/g, ''),
            placa: item?.placacavalo,
            viagem_cancelado:
                Number(item?.statusviagem) === 2
                    ? enum_viagem_cancelado.S
                    : enum_viagem_cancelado.N,
            dt_cliente: new Date(item?.datahora),
            dt_criacao: new Date(),
            dt_atualizacao: new Date(),
        };
    });
};
