const express= require('express');
const app= express()
const tasks = require ('./data')
const http = require('http');

app.use(express.json());
app.use(express.urlencoded());


app.get('/',(req,res)=>{
    console.log('user clicked the server')
    res.status(200).send('home page')
})
app.get('/tasks',(req,res)=>{
     res.status(200).json({success:true, data:tasks})
})


app.post('/tasks/add',(req,res)=>{
     console.log(req.body);
     console.log("im testing ts shi")
      
})


app.use((req,res)=>{
    res.status(404).send('resource not found')
})
app.listen(8080,()=>{
    console.log('server is listening on port 8080')
})