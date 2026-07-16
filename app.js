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

app.get('/tasks/:id',(req,res)=>{
    const id= req.params.id;

    const taskid = tasks.find((task)=>{
    return task.id === Number(id)})

    if(!taskid){
        return res.status(404).json({success:false, message:'task doesnt exist'})
    }
    return res.json({success:true, data:{taskid}})
})

app.post('/tasks/add',(req,res)=>{
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


app.put('/tasks/:id',(req,res)=>{
      const id=req.params.id;
      const {taskname,category,completed}= req.body;


      if(!taskname||!category||completed === undefined){
        //return res.send("every field is required")
        return res.status(400).json({success:false, message:"every field is required"})
     }

          const Task_update = tasks.find((task)=>{
    return task.id === Number(id)})
    
    if(!Task_update){
        return res.status(404).json({success:false, message:"task not found"})
    }
      
        Task_update.taskname= taskname;
        Task_update.category= category;
        Task_update.completed= completed; 
        res.status(200).json({success:true, data:{Task_update}})
      
})

app.patch('/tasks/:id',(req,res)=>{
    const id= Number(req.params.id);
    const {taskname, category, completed}= req.body;

    const taskpartial=  tasks.find(task=>task.id === id);
     
    if(!taskpartial){
        return res.status(404).json({success:false, message:"task not found"})
    }
     if(taskname){
        taskpartial.taskname= taskname;
        //return res.status(200).json({success:true, data:{taskpartial}})
     }
     if(category){
        taskpartial.category= category;
        //return res.status(200).json({success:true, data:{taskpartial}})
     }
     if(completed !== undefined){
        taskpartial.completed= completed;
        //return res.status(200).json({success:true, data:{taskpartial}})
     }
res.status(200).json({success:true, data:{taskpartial}})
     
})

app.use((req,res)=>{
    res.status(404).send('resource not found')
})
app.listen(8080,()=>{
    console.log('server is listening on port 8080')
})