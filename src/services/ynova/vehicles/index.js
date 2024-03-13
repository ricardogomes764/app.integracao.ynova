import 'dotenv/config';
import { StateTypes } from '../../../shared/stateTypes.js';
import { showLog } from '../../utils/memory.js';
import { getLastSync, updateLog } from '../logs.controller.js';
import { TableTypes } from '../../../shared/tableTypes.js';
import { getYnovaData } from '../api.data.js';
import { createNewVehicles } from './create.js';
import { refreshStatusVehicle } from './status.js';
import { parseData } from './parse.js';

export async function ynovaServiceVehicle({ token }) {
    const syncTable = TableTypes.veiculos;

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

            let dataParsed = await parseData(data);

            await createNewVehicles([...dataParsed]);

            await refreshStatusVehicle(dataParsed);

            dataParsed = null;
            data = null;

            showLog(dataParsed?.length);

            await updateLog({ id: logId, state: StateTypes.success });

            console.log('get vehicles data finished');
        } catch (error) {
            console.log(error);
        }
    };

    await getData(0);
}
