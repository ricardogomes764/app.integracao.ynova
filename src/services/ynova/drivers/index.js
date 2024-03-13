import 'dotenv/config';
import { StateTypes } from '../../../shared/stateTypes.js';
import { showLog } from '../../utils/memory.js';
import { getLastSync, updateLog } from '../logs.controller.js';
import { TableTypes } from '../../../shared/tableTypes.js';
import { getYnovaData } from '../api.data.js';
import { createNewDriver } from './create.js';
import { refreshStatusDriver } from './status.js';
import { parseData } from './parse.js';

export async function ynovaServiceDriver({ token }) {
    const syncTable = TableTypes.motoristas;

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

            // console.log(dataParsed);

            await createNewDriver([...dataParsed]);
            await refreshStatusDriver(dataParsed);

            dataParsed = null;
            data = null;

            showLog(dataParsed?.length);

            await updateLog({ id: logId, state: StateTypes.success });

            console.log('get drivers data finished');
        } catch (error) {
            console.log(`Error on getData :`, error);
        }
    };
    await getData(0);
}
