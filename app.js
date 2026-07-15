const express= require('express');
const app= express()
const tasks = require ('./data')
const http = require('http');

app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.get('/',(req,res)=>{
    console.log('user clicked the server')
    res.status(200).send('home page')
})
app.get('/tasks',(req,res)=>{
     res.status(200).json({success:true, data:tasks})
})


app.post('/tasks',(req,res)=>{
    console.log(tasks);
    console.log(tasks.length);
    let newtaskID;
    if(tasks.length===0){
        console.log("no tasks");
        newtaskID=1;
    } else {
        console.log(tasks[tasks.length-1]);
        newtaskID=tasks[tasks.length-1].id+1
    }
     console.log(req.body);
    const {taskname, category}= req.body;
     const newtask={
        id: newtaskID,
        taskname,
        category,
        completed:false
     }
    tasks.push(newtask)

    res.status(201).json({status:"sucess", data:{task:newtask}});
})


app.use((req,res)=>{
    res.status(404).send('resource not found')
})
app.listen(8080,()=>{
    console.log('server is listening on port 8080')
})