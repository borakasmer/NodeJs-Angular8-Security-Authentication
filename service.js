var express = require("express");
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();

let jwt = require('jsonwebtoken');
let config = require('./config');
let token = require('./token');
var crypto = require('crypto'); //Default Geliyor

app.use(cors({
    exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization', 'RefreshToken', 'Token'],
}));

//Swagger
var swaggerUi = require('swagger-ui-express');
swaggerDocument = require('./swagger.json');

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//---------------------

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());


mongoose.connect('mongodb://localhost/people', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.set('useFindAndModify', false);

var humanSchema = new mongoose.Schema({
    gender: String,
    email: String,
    username: String,
    name: {
        title: String,
        first: String,
        last: String
    },
    fullName: String
});

var ClientSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255
    }
});

var Client = mongoose.model('Client', ClientSchema, 'clients');
var Human = mongoose.model('Human', humanSchema, 'users');

/* app.get('/', function (req, res) {
    res.send("Selam Millet @coderBora");
}) */

app.get("/people", token, function (req, res) {
    //res.send("Günaydın Millet");    
    Human.find(function (err, doc) {
        doc.forEach(function (item) {
            item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
        });
        res.send(doc);
    })
})

app.get("/peopleDesc", token, function (req, res) {
    //res.send("Günaydın Millet");
    Human.find()
        .sort('-_id')
        .exec(
            function (err, doc) {
                doc.forEach(function (item) {
                    item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
                });
                res.send(doc);
            })
})

app.get("/getpeoplebyPaging/:page/:count", token, function (req, res) {
    //res.send("Günaydın Millet");    
    var page = parseInt(req.params.page) - 1;
    var rowCount = parseInt(req.params.count);
    var skip = page * rowCount;
    Human.find()
        .skip(skip)
        .limit(rowCount)
        .exec(
            function (err, doc) {
                if (doc != null) {
                    doc.forEach(function (item) {
                        item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
                    });
                }
                res.send(doc);
            }
        )
})

app.get("/getpeopleByUsername/:name", token, function (req, res) {
    //res.send("Günaydın Millet");
    console.log(req)
    var query = { username: req.params.name };
    Human.find(query, function (err, doc) {
        doc.forEach(function (item) {
            item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
        });
        res.send(doc);
    })
})
app.get("/getpeopleByLastname", token, function (req, res) {
    //res.send("Günaydın Millet");
    var query = { "name.last": req.query.lastname };
    Human.find(query, function (err, doc) {
        doc.forEach(function (item) {
            item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
        });
        res.send(doc);
    })
})

app.get("/getpeopleContainsOrderTopWith/:name/:top", token, function (req, res) {
    //res.send("Günaydın Millet");
    var query = { "name.first": { $regex: req.params.name } };
    var top = parseInt(req.params.top);
    Human.find(query)
        .sort('-name.first')
        .skip(1)
        .limit(top)
        .exec(
            function (err, doc) {
                doc.forEach(function (item) {
                    item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
                });
                res.send(doc);
            }
        )
})

app.get("/getpeopleStartsWith/:name", token, function (req, res) {
    //res.send("Günaydın Millet");
    var query = { "name.first": { $regex: '^' + req.params.name } };
    Human.find(query, function (err, doc) {
        doc.forEach(function (item) {
            item.fullName = item._doc.name.first + ' ' + item._doc.name.last;
        });
        res.send(doc);
    })
})

app.post('/insertPeople', token, async (req, res) => {
    console.log("req.body : " + req.body.username);
    console.log("req.body.last : " + req.body.name.last);
    try {
        var person = new Human(req.body);
        var result = await person.save();
        res.send(result);
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post('/updatePeople', token, async (req, res) => {
    console.log("req.username : " + req.body.username);
    try {
        var updatePerson = new Human(req.body);
        const person = await Human.findOne({ username: updatePerson.username });
        await person.updateOne(updatePerson);
        /*  return res.send("succesfully saved"); */
        /* return true; */
        return res.status(200).json({ status: "succesfully update" });
    } catch (error) {
        res.status(500).send(error);
    }
})

app.post('/login', async (req, res) => {
    try {
        console.log("req.username : " + req.body.username);
        console.log("req.password : " + req.body.password);
        var password = Decrypt(req.body.password);
        //Encrypt
        this.salt = config.salt;
        //this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
        //--------------------------
        var query = { username: req.body.username, password: this.hash };
        Client.find(query, function (err, doc) {
            if (doc.length > 0) {
                let token = jwt.sign({ username: req.body.username },
                    config.secret,
                    {
                        expiresIn: '1h' // expires in 1 hour
                        /* expiresIn: 15 // expires in 15 minutes */
                    }
                );
                var refreshToken = jwt.sign({ username: req.body.username },
                    config.secret,
                    {
                        expiresIn: '2h' // expires in 2 hour                            
                    }
                );
                return res.status(200).json({ status: "succesfully login", token: token, refreshToken: refreshToken, success: true });
            }
            else {
                return res.status(401).send("Username or Password Wrong!");
            }
        })

        /* if (req.params.username == "bora" && req.params.password == "123456") {
             return res.status(200).json({ status: "succesfully login" });
         }
         else {
             return res.status(401).send("Username or Password Wrong!");
         }*/
    } catch (error) {
        res.status(500).send(error);
    }
})

app.get("/checkToken", token, function (req, res) {
    return res.status(200).json({ status: "succesfully logedin" });
});


app.post('/deletePeople', token, (req, res) => {
    console.log("req.username : " + req.body.username);
    try {
        var deletePerson = new Human(req.body);
        Human.findOneAndRemove({ username: deletePerson.username })
            .then(function (doc) {
                if (doc) {
                    //return res.send("succesfully delete");
                    return res.status(200).json({ status: "succesfully delete" });
                }
                else {
                    return res.send("no document found!");
                }
            }).catch(function (error) {
                throw error;
            });
    } catch (error) {
        res.status(500).send(error);
    }
})

function Decrypt(password) {
    let keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";

    var output = "";

    var i = 0;
    password = password.replace("/[^ A - Za - z0 - 9\+\/\=] / g", "");
    do {
        var enc1 = keyStr.indexOf(password[i++]);
        var enc2 = keyStr.indexOf(password[i++]);
        var enc3 = keyStr.indexOf(password[i++]);
        var enc4 = keyStr.indexOf(password[i++]);

        var chr1 = (enc1 << 2) | (enc2 >> 4);
        var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        var chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
        chr1 = chr2 = chr3 = null;
        enc1 = enc2 = enc3 = enc4 = null;
    } while (i < password.length);
    output = unescape(output);
    var pattern = new RegExp("[|]");
    output = output.replace(pattern, "+");
    return output;
}

app.listen(9480);

/* mongoimport--db people--collection users--jsonArray users.js */
/* https://petstore.swagger.io/ */
/* https://editor.swagger.io/ */