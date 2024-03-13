import axios from 'axios';
import 'dotenv/config';

export const apiYnova = axios.create({
    baseURL: `${process.env.YNOVA_API_SERVER}`,
    timeout: 900000,
});
