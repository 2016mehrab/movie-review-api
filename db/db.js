
const mysql = require("mysql");
const connection = mysql.createConnection({
    host:"127.0.0.1",
    user:"",
    password:"",
    database:"movie"
})
module.exports={connection};