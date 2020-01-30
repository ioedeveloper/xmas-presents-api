// importing libraries and dependencies
import { Request, Response } from 'express';
import express = require('express');
import bodyParser = require('body-parser');

// tslint:disable-next-line: no-var-requires
const data = require('../data.json');
// tslint:disable-next-line: no-var-requires
const fs = require('fs');
// create a new express application instance
const app: express.Application = express();

// the port the express app will listen on
const port: any = process.env.PORT || 2002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
        message: 'Service is up!',
    }));
});

app.get('/api/v1', (req: Request, res: Response) => {
    return res.status(200).send(data);
});

app.get('/api/v1/:friend', (req: Request, res: Response) => {
    const name: string = req.params.friend;
    const friend = data[name];

    if (friend) {
        return res.status(200).send({
            [name]: friend,
        });
    } else {
        return res.status(404).send({
            error: 'Friend not found on Santa\'s List',
        });
    }
});

app.post('/api/v1/:friend', (req: Request, res: Response) => {
    const name: string = req.params.friend;
    const newEntry = req.body;

    if (!data[name]) {
        if (!newEntry.gift) return res.status(400).send({
            error: 'Invalid Request: Data must contain gift.',
        });
        if (!newEntry.from) return res.status(400).send({
            error: 'Invalid Request: Data must specify `from`.',
        });
        const newList = { ...data, [name]: newEntry };

        try {
            return fs.writeFile('data.json', JSON.stringify(newList), 'utf8', () => {
                return res.status(200).send({
                    [name]: newEntry,
                });
            });
        } catch (error) {
            return res.status(500).send({
                error: 'Internal Server Error.',
            });
        }
    } else {
        return res.status(400).send({
            error: 'Your friend is already on Santa\'s list.',
        });
    }
});

// serve the application at the given port
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`Listening at http://localhost:${port}/`);
});
