import http from 'http';
import express from 'express';
import path from 'path';
import { corsHandler } from './middleware/corsHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { SERVER } from './config';
import { Socket } from 'socket.io';



export const app = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = () => {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(corsHandler);

    app.get('/main/check', (req, res, next) => {
        return res.status(200).json({ hello: 'world!' });
    });


    app.use(routeNotFound);
    httpServer = http.createServer(app);
    httpServer.listen(SERVER.SERVER_PORT, () => {
        console.log(`chat Server run at http://${SERVER.SERVER_HOST}:${SERVER.SERVER_PORT} `)
    });


    const io = require('socket.io')(httpServer);

    let socketConnected: any = new Set();
    io.on('connection', onConnected);

    function onConnected(socket: Socket) {
        console.log(socket.id);
        socketConnected.add(socket.id);

        io.emit('clients-total', socketConnected.size);
        socket.on('disconnect', () => {
            console.log('Socket disconnected', socket.id);
            socketConnected.delete(socket.id);
            io.emit('client-total', socketConnected.size);

        })

        socket.on('message', (data)=>{
            socket.broadcast.emit('chat-message', data)
        })

        socket.on('feedback', (data) =>{
            socket.broadcast.emit('feedback', data)
        })
    }



};

export const Shutdown = (callback: any) => httpServer && httpServer.close(callback);

Main();