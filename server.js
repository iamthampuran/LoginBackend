//mongodb
require('./config/db');


const app = require('express')();
const port = 3001;
const UserRouter = require('./api/user')
/*UserRouter.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
*/

const cors = require('cors')

var options = {
    "origin":"*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
}
app.use(cors(options))

const bodyParser = require('express').json
app.use(bodyParser())

app.use('/user',UserRouter)

app.listen(port, ()=>{
    console.log('Server Running on port',port)
})
