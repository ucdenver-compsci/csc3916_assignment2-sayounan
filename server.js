/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

const express = require('express');
const bodyParser = require('body-parser');
const authController = require('./auth');
const authJwtController = require('./auth_jwt');
db = require('./db')(); //hack
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    const json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.route('/signup')
    .post( (req, res) => {
        if (!req.body.username || !req.body.password) {
            res.json({success: false, msg: 'Please include both username and password to signup.'})
        } else {
            const newUser = {
                username: req.body.username,
                password: req.body.password
            };

            db.save(newUser); //no duplicate checking
            res.json({success: true, msg: 'Successfully created new user.'})
        }
    })

    .all((req, res) => {
        res.status(405).json({success: false, msg: 'HTTP Method Not Allowed'});
    });

router.route('/signin')
    .post((req, res) => {
        const user = db.findOne(req.body.username);

        if (!user) {
            res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            if (req.body.password === user.password) {
                const userToken = {id: user.id, username: user.username};
                const token = jwt.sign(userToken, process.env.UNIQUE_KEY);
                res.json ({success: true, token: 'JWT ' + token, basic: 'Basic ' + cred});
            } else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        }

    })

    .all((req, res) => {
        res.status(405).json({success: false, msg: 'HTTP Method Not Allowed'});
    });

router.route('/movies')
    .get((req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "GET Movies";
        res.status(200).json(o);
    })

    .post((req, res) => {
        const newMovie = { title: req.body.title, year: req.body.year }
        db.save(newMovie)
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "Movie Saved";
        res.status(200).json(o);
    })

    .put(authJwtController.isAuthenticated, (req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "Movie Updated";
        res.status(200).json(o);
    })

    .delete(authController.isAuthenticated, (req, res) => {
        const o = getJSONObjectForMovieRequirement(req);
        o.status = 200;
        o.message = "movie deleted";
        res.json(o);
    })

    .all((req, res) => {
        res.status(405).json({success: false, msg: 'HTTP Method Not Allowed'});
    })

router.route('/testcollection')
    .delete(authController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
            const o = getJSONObjectForMovieRequirement(req);
            res.json(o);
    }
    )
    .put(authJwtController.isAuthenticated, (req, res) => {
        console.log(req.body);
        res = res.status(200);
        if (req.get('Content-Type')) {
            res = res.type(req.get('Content-Type'));
        }
            const o = getJSONObjectForMovieRequirement(req);
            res.json(o);
    }
    );
    
app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


