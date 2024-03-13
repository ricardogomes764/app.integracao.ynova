import { ModelDriver } from '../../models/drivers.js';
import { ModelOwner } from '../../models/owners.js';
import { ModelTravel } from '../../models/travels.js';
import { ModelVehicle } from '../../models/vehicles.js';

export const getLocalID = async (travel) => {
    let modelTravel = new ModelTravel();
    let modelDriver = new ModelDriver();
    let modelOwner = new ModelOwner();
    let modelVehicle = new ModelVehicle();

    const clearData = () => {
        modelTravel = null;
        modelDriver = null;
        modelOwner = null;
        modelVehicle = null;
        return {
            idmotorista: undefined,
            idproprietario: undefined,
            idveiculo: undefined,
            isValidData: undefined,
        };
    };

    const id = await modelTravel.getTravelIDByCustomerNumber(
        travel.numero_cliente
    );
    console.log('---->', travel.numero_cliente, id);
    if (id) return clearData(); // travel has imported

    const idmotorista = await modelDriver.getDriverIDByCpf(travel.cpf_mot);
    console.log(
        `idmotorista:${idmotorista} - travel.cpf_mot:${travel.cpf_mot}`
    );
    if (!idmotorista) return clearData();

    const idproprietario = await modelOwner.getOwnerIDByCpfOrCnpj(
        travel.cpf_cnpj_prop
    );
    console.log('idproprietario---->', idproprietario);
    if (!idproprietario) return clearData();

    const idveiculo = await modelVehicle.getVehicleIDByLicensePlate(
        travel.placa
    );
    console.log('idveiculo---->', idveiculo);
    if (!idveiculo) return clearData();

    clearData();

    return { idmotorista, idproprietario, idveiculo, isValidData: true };
};
