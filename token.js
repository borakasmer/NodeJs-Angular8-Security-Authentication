let jwt = require('jsonwebtoken');
//npm install jsonwebtoken

const config = require('./config.js');

module.exports = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase    
    if (token != undefined && token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token && token != "undefined" && token != undefined) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                req.decoded = decoded;
                var exp = new Date(decoded.exp * 1000);
                //var iat = new Date(decoded.iat * 1000);
                var now = new Date();
                var difference = exp.getTime() - now.getTime();
                var resultInMinutes = Math.round(difference / 60000);
                //Refresh Token Time
                if (resultInMinutes < 59) { //resultInMinutes < 15 olacak
                    var refreshToken = req.headers['refreshtoken']
                    if (refreshToken && refreshToken!="" && refreshToken != "undefined" && refreshToken != undefined) {
                        jwt.verify(refreshToken, config.secret, (err, decoded) => {
                            if (err) {
                                console.log(err);
                            } else {
                                var newToken = jwt.sign({ username: decoded.username },
                                    config.secret,
                                    {
                                        expiresIn: '1h' // expires in 1 hour                            
                                    }
                                );
                                var newRefreshToken = jwt.sign({ username: decoded.username },
                                    config.secret,
                                    {
                                        expiresIn: '2h' // expires in 2 hour                            
                                    }
                                );
                                res.setHeader('Token', newToken);
                                res.setHeader('RefreshToken', newRefreshToken);
                            }                           
                        })
                    }
                }
                // End Refresh Token -----------
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};