import 'dotenv/config';
import { StateTypes } from '../../../shared/stateTypes.js';
import { showLog } from '../../utils/memory.js';
import { getLastSync, updateLog } from '../logs.controller.js';
import { TableTypes } from '../../../shared/tableTypes.js';
import { getYnovaData } from '../api.data.js';
import { createNewTravels } from './create.js';
import { parseData } from './parse.js';
import { parseData as parseDataVeic} from './parseVeicTrave.js'
import { parseData as parseDataMot} from './parseMotTravel.js'
import { parseData as parseDataProp} from './parsePropTravel.js'
import { createNewVehicles } from '../vehicles/create.js';
import { refreshStatusVehicle } from '../vehicles/status.js';
import { createNewDriver } from '../drivers/create.js';
import { refreshStatusDriver } from '../drivers/status.js';
import { createNewOwners } from '../owners/create.js';
import { refreshStatusOwner } from '../owners/status.js';

export async function ynovaServiceTravel({ token }) {
    const syncTable = TableTypes.viagens;

    const { lastSync, logId } = await getLastSync(syncTable);

    const getData = async () => {
        try {
            console.log(`get ${syncTable} data`);

            let data = await getYnovaData({
                tableType: syncTable,
                lastSync,
                token,
            });

            if (!data) {
                await updateLog({ id: logId, state: StateTypes.success });
                console.log(`get ${syncTable} data finished`);

                return;
            }

            //CREATE VEICULO
            let dataParsedVeic = await parseDataVeic(data);

            await createNewVehicles([...dataParsedVeic]);

            await refreshStatusVehicle(dataParsedVeic);

            //CREATE MOTORISTAS
            let dataParsedMot = await parseDataMot(data);

            await createNewDriver([...dataParsedMot]);
            await refreshStatusDriver(dataParsedMot);

            //CREATE PROPRIETARIOS
            let dataParsedProp = await parseDataProp(data);

            await createNewOwners([...dataParsedProp]);

            await refreshStatusOwner(dataParsedProp);

            //CREATE VIAGENS
            let dataParsed = await parseData(data);

            await createNewTravels([...dataParsed]);

            dataParsed = null;
            data = null;

            showLog(dataParsed?.length);

            await updateLog({ id: logId, state: StateTypes.success });

            console.log('get travels data finished');
        } catch (error) {
            console.log(error);
        }
    };

    await getData(0);
}
