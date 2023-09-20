const net = require('net');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const BASE_DIR = process.argv[2] || __dirname + '/public';
const PORT = process.argv[3] || 8080;
const TIMEOUT = 20000;

function handleRequest(socket) {
    const resume = {};

    socket.setEncoding('utf-8');

    socket.on('data', (data) => {
        const request = data.trim().split(' ');
        const method = request[0];
        resume.method = method;
        let filePath;
        if (request[1] === '/' || request[1] === '') filePath = path.join(BASE_DIR, 'index.html');
        else filePath = path.join(BASE_DIR, request[1]);
        resume.filePath = request[1];
        const contentType = mime.lookup(filePath);

        if (method === 'GET') {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                    resume.statusCode = 404;
                    socket.end();
                } else {
                    socket.write('HTTP/1.1 200 OK\r\n');
                    socket.write('Server: Lucas`s server\r\n');
                    socket.write(`Content-Type: ${contentType}\r\n`);
                    socket.write(`Content-Length: ${content.length}\r\n`);
                    socket.write('\r\n');
                    socket.write(content);
                    resume.statusCode = 200;
                    socket.end();
                }
            });
        } else {
            socket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
            resume.statusCode = 502;
            socket.end();
        }
    });

    socket.on('end', () => {
        console.log(`${Date.now()} - ${socket.remoteAddress} - ${resume.method} ${resume.filePath} - ${resume.statusCode}`);
        fs.writeFile(path.join((process.argv[2] || __dirname), 'log.txt'), `${Date.now()} - ${socket.remoteAddress} - ${resume.method} ${resume.filePath} ${resume.statusCode}\n`, { flag: 'a' }, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
        });
    });
}

const server = net.createServer();

server.on('connection', (socket) => {
    socket.setTimeout(TIMEOUT);

    socket.on('timeout', () => {
        socket.end();
    });

    handleRequest(socket);
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
