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
console.log("DB_USER exists:", !!process.env.DB_USER);
console.log("DB_HOST exists:", !!process.env.DB_HOST);
console.log("DB_NAME exists:", !!process.env.DB_NAME);
console.log("DB_PASSWORD exists:", !!process.env.DB_PASSWORD);
console.log("DB_PORT exists:", !!process.env.DB_PORT);

module.exports= pool;