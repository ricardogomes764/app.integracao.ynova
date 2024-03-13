import { apiYnova } from './api.js';

export const getToken = async () => {
    try {
        const body = {
            wsautenticacao: process.env.YNOVA_USER,
            wssenha: process.env.YNOVA_PASSWORD,
        };

        const response = await apiYnova.post('/TUsuarioController/login', body);

        if (!response?.data?.token)
            throw new Error('Authentication error on response');

        const { token } = response.data;
        return token;
    } catch (error) {
        console.log(`Authentication error ${error}`);
    }
};
