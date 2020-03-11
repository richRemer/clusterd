const express = require("express");
const parser = require("body-parser");
const tlsopt = require("tlsopt");
const clusterd = require("..");
const app = express();
const cluster = clusterd();
const server = tlsopt.createServerSync(app);

app.use(parser.json());

app.put("/resource/:id", async (req, res) => {
    const {body, params: {id}} = req;
    const resource = await clusterd.createResource(id, body);
    res.redirect(url(resource));
});

app.put("/mutex/:id", async (req, res) => {
    if (await clusterd.createResource(req.path, req.body)) {
        res.status(202).send();
    } else {
        res.set("Content-Type": "text/plain;charset=utf8");
        res.status(409).send("");
    }
});

app.get("/mutex/:id", async (req, res) => {
    const {path} = req;
    const mutex = await clusterd.fetchResource(req.path);

    if (mutex) {
        res.json(mutex);
    } else {
        res.status(404).send();
    }
});

server.listen(process.env.LISTEN_PORT ? (server.tls ? 443 : 80), () => {
    const {address, port} = server.address();
    const host = address.replace(/^(.*:.*$)/, "[\1]");
    console.info(`listening on ${host}:${port}`);
});

function url(resource) {
    const {type, id} = resource;
    return `/${type}/${id}`;
}
