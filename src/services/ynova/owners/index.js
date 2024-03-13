import 'dotenv/config';

import { StateTypes } from '../../../shared/stateTypes.js';
import { TableTypes } from '../../../shared/tableTypes.js';
import { getLastSync, updateLog } from '../logs.controller.js';
import { createNewOwners } from './create.js';
import { refreshStatusOwner } from './status.js';
import { getYnovaData } from '../api.data.js';
import { showLog } from '../../utils/memory.js';
import { parseData } from './parse.js';

export async function ynovaServiceOwner({ token }) {
    const syncTable = TableTypes.proprietarios;
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

            await createNewOwners([...dataParsed]);

            await refreshStatusOwner(dataParsed);

            dataParsed = null;
            data = null;

            showLog(dataParsed?.length);

            await updateLog({ id: logId, state: StateTypes.success });
        } catch (error) {
            console.log(`Error on getData :`, error);
        }
    };

    await getData(0);
}
