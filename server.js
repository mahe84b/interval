var express = require('express'),
    app = express(),                
    request = require("request"),
    bodyParser = require('body-parser'),
    Interval_Controller = require('./controllers/interval-controller.js');
console.log("Starting Server for Vimond Service Calls.....");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));    
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    next();
});

// making logger available in all requests
app.use(function(req,res,next){
    next();
});

console.log("Vimond API Server Started.....");
console.log("Server Running at: http://localhost:3000/\nPlease make a POST call to http://localhost:3000/\nRefer to the postman file in docs folder");

app.get('/', (req, res) => res.send('<center><b>Welcome To Vimond API Server <br> Please read the instructions in Read me to use the APIs</b></center>'))
app.post('/getranges', Interval_Controller.filterRanges);
app.get('/printfizzbuzz', Interval_Controller.printFizzBuzz);
var server = app.listen(3000);