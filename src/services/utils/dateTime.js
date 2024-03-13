export const scatterDate = (value) => {

    const date = value.split('T')[0];
    const separator = date.includes('/') ? '/' : '-';

    const [year, month, day] = date.split(separator);

    return { day, month: month - 1, year };
};

export const dateLessThanNow = ({ lastSync }) => {
    const currentDate = new Date();
    const dateRef = new Date(lastSync);

    return (
        currentDate > dateRef &&
        currentDate.toLocaleDateString() !== lastSync.toLocaleDateString()
    );
};

export const getDateTimeFromString = (str, nullLabel = false) => {
    const dateSeparator = str?.includes('/') ? '/' : '-';
    if (nullLabel && !str) return null;
    if (!str) return new Date();

    const [dateValues, timeValues] = str.trim().includes(' ')
        ? str.split(' ')
        : `${str} 00:00:00`.split(' ');

    const [day, month, year] = dateValues.split(dateSeparator);

    const [hours, minutes] = timeValues.split(':');

    let dateConverted = new Date(
        Number(year),
        +month - 1,
        +day,
        +hours + Number(process.env.UTC_TIME_ZONE || 0),
        +minutes
    );

    if (dateConverted > new Date()) dateConverted = new Date();

    return dateConverted;
};

export const getDateTimeNow = (value) => {
    let str = new Date().toLocaleString('pt-BR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
    });
    if (value)
        str = new Date(value).toLocaleString('pt-BR', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false,
        });

    return str;
};

export const getDateFormated = (value, nullable = true) => {
    //2023-02-11T13:56:57
    const separator = value.includes('-') ? '-' : '/';

    const dateAux = new Date();
    const [, timezone] = dateAux.toISOString().split('.');

    if (nullable && !value) return null;

    if (!nullable && !value) return new Date();

    const [date, time] = value.split(' ');
    const newDate = [
        date.slice(4, 8),
        separator,
        date.slice(2, 4),
        separator,
        date.slice(0, 2),
        'T',
        time,
        '.',
        timezone,
    ].join('');

    return newDate;
};
