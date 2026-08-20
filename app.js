require("dotenv").config();
const express= require('express');
require("./Config/db")
const taskroute= require('./Routes/tasksRoute');
const subtaskRoute= require('./Routes/subtask-route')
const authRoutes= require('./Routes/authRoutes');
const errorHandle= require('./Middleware/errorhandlingMiddleware');



const cors = require('cors');

const app= express()
const http = require('http');

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//Routes
app.use('/auth', authRoutes)
app.use('/tasks', taskroute)
app.use('/tasks/:taskID/subtasks',subtaskRoute)

//Home Route
app.get('/',(req,res)=>{
    console.log('user clicked the server')
    res.status(200).send('home page')
})

//404
app.use((req,res)=>{
    res.status(404).send('resource not found')
})
//Error handler for routes
app.use(errorHandle);

//server running
app.listen(8080,()=>{
    console.log('server is listening on port 8080')
})