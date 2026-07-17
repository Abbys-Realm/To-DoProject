const express= require('express');
const taskroute= require('./Routes/tasks')

const app= express()
const http = require('http');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.get('/',(req,res)=>{
    console.log('user clicked the server')
    res.status(200).send('home page')
})

app.use('/tasks', taskroute)

app.use((req,res)=>{
    res.status(404).send('resource not found')
})
app.listen(8080,()=>{
    console.log('server is listening on port 8080')
})