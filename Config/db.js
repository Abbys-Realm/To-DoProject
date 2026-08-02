const {Pool}= require("pg");

//a variable that connect the database to the backend 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

//if the db is connected it'll display connected 
//else display the error
pool.connect().then(()=>console.log("connected"))
.catch(err=>console.log(err));


module.exports= pool;