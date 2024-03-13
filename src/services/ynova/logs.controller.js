import { LogsIntegration } from '../../models/logs_integration.js';
import { StateTypes } from '../../shared/stateTypes.js';

export const getLastSync = async (table) => {
    let logsIntegration = new LogsIntegration();
    const lastSync = await logsIntegration.findLastSync(table);

    const logId = await logsIntegration.createSync({
        table_name: table,
        state: StateTypes.inProgress,
    });

    logsIntegration = null;
    return { lastSync, logId };
};

export const updateLog = async ({ id: logId, state: stateType }) => {
    let logsIntegration = new LogsIntegration();
    await logsIntegration.updateSync({ id: logId, state: stateType });
    logsIntegration = null;
};
