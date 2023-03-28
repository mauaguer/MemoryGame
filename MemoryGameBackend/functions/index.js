const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
const app = express();

const corsOpts = {
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PATCH'
    ],
    allowedHeaders: [
        'Content-Type',
        'Access-Control-Allow-Origin'
    ],
};

app.use(cors(corsOpts));

// app.use(cors());

const icons = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🌭', '🍔', '🍟', '🍕', '🥫', '🍦', '🥧', '🧁', '🍰', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥨', '🧀', '🥎', '🥃', '🍷', '🍹', '🎱'];

const baseURL = "https://memory-game-ce61c-default-rtdb.firebaseio.com/data/";
var maxNumberOfItems = 8;


exports.helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandonIconIdexList(iconIndexList) {
    if (iconIndexList.length == maxNumberOfItems) {
        return iconIndexList;
    }

    var randomIndex = getRandomInt(0, (icons.length - 1));

    for (let i = 0; i < iconIndexList.length; i++) {
        if (iconIndexList[i] === randomIndex) {
            return createRandonIconIdexList(iconIndexList);
        }
    }

    iconIndexList.push(randomIndex);
    return createRandonIconIdexList(iconIndexList);
}

// Fisher - Yates shuffle.The idea is to walk the array in the reverse order and swap each element with a random one before it:
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

app.get('/cards/:number', (req, res) => {

    maxNumberOfItems = 8;
    var cards = [];
    var iconIndexList = [];

    if (req.params.number) {
        if (req.params.number < 25) {
            maxNumberOfItems = req.params.number;
        }
    }

    createRandonIconIdexList(iconIndexList);

    for (let i = 0; i < iconIndexList.length; i++) {
        cards.push({ isDiscovered: false, icon: icons[iconIndexList[i]], id: iconIndexList[i] });
    }

    cards.push(...cards);

    shuffle(cards);

    res.send(JSON.stringify({ cards: cards }));
});

app.get('/scores', (req, res) => {

    var url = baseURL + 'scores.json';

    axios.get(url)
        .then(function (response) {
            // handle success
            var sortedScores = [];
            var scoresData = response.data;

            if (scoresData !== null) {
                var scoresTemp = [];
                for (const key in scoresData) {
                    const score = scoresData[key];
                    scoresTemp.push(score);
                }

                sortedScores = scoresTemp.sort(function (a, b) {
                    return a.score - b.score;
                });
            }

            res.send(JSON.stringify(sortedScores.splice(0, 30)));
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
});

app.post('/scores', async (req, res) => {

    var url = baseURL + 'scores.json';
    const score = JSON.parse(req.body);

    if (score.score > 0 &&
        score.clicks > 8 &&
        score.time > 0 &&
        score.username !== '') {

        axios.post(url, score)
            .then(function (response) {
                res.send(response.body);
            })
            .catch(function (error) {
                res.send(JSON.stringify({ 'error': 'Score data is not valid' }));
            });

    } else {
        res.send(JSON.stringify({ 'error': 'Score data is not valid' }));
    }
});

exports.app = functions.https.onRequest(app);


