import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test : {
        globals : true,
        environment : 'node'
    },

    resolve : {
        alias:{
            // pour que Vitest sache que #lib pointe vers src/lib
            '#lib': path.resolve(__dirname, './src/lib'),
            '#controllers': path.resolve(__dirname, './src/controllers'),
            '#services': path.resolve(__dirname, './src/services'),
            '#middlewares': path.resolve(__dirname, './src/middlewares'),
            '#routes': path.resolve(__dirname, './src/routes'),
            '#schemas': path.resolve(__dirname, './src/schemas'),
            '#dto': path.resolve(__dirname, './src/dto'),
        },
    },
})