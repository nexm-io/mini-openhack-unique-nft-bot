import { createClient } from 'redis';

export const client = createClient({
    password: '',
    socket: {
        host: 'localhost',
        port: 6379
    }
});