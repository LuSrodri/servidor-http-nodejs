const http = require('http');
const url = require('url');
const fs = require('fs');

// Servidor HTTP
http.createServer(async (request, response) => {
    // Parseando URL
    const parsedUrl = url.parse(request.url);

    // Verificando o método do request
    if (request.method !== 'GET') {
        response.statusCode = 501;
        response.end('Você precisa usar o método HTTP GET');
        return;
    }

    // Construindo caminho do arquivo
    const pathname = `./${parsedUrl.pathname}`;

    // Lendo arquivo
    fs.readFile(pathname, (error, file) => {
        if (error) {
            response.statusCode = 404;
            response.end(`O arquivo ${pathname} não foi encontrado!`);
            return;
        }
        response.end(file);
    });
}).listen(8000, () => {
    console.log('Servidor rodando na porta 8000');
});