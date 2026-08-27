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
const PORT= process.env.PORT || 8080;

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
     res.status(200).send('home page')
})

//404
app.use((req,res)=>{
    res.status(404).send('resource not found')
})
//Error handler for routes
app.use(errorHandle);

//server running
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})