const { json } = require('express');
const tasks= require('../DATA/data');

const getall= (req,res)=>{
    const{taskname,category,completed}= req.query;
    //if(completed){
    //const parsebool= JSON.parse(completed);

    //this will return true if both conditions are true
    //if( parsebool !== undefined && category!== undefined){
        //const filterTasks= tasks.filter((complete)=> 
           // complete.completed=== parsebool && complete.category=== category )
       // return res.status(200).json({success: true, data:filterTasks});
  //  }   }
    //this will return true if either conditions are true
    //if( parsebool !== undefined && category!== undefined && taskname!== undefined){
     //   const filterTasks= tasks.filter((complete)=> 
       //     complete.completed=== parsebool&& complete.category=== category
       //  && complete.taskname=== taskname)
      //  return res.status(200).json({success: true, data:filterTasks});
  //  }}

    let filteredtasks= tasks;
    if(category){
        filteredtasks= filteredtasks.filter(task=>

            task.category=== category
        )
    }
    if(completed){
        const parsecomplete= JSON.parse(completed);
        filteredtasks= filteredtasks.filter(task=>

            task.completed=== parsecomplete
        )
    }
    if(taskname){
        filteredtasks= filteredtasks.filter(task=>

            task.taskname=== taskname
        )
    }
      
    return res.status(200).json({
    success: true,
    data: filteredtasks
});
    
    res.status(200).json({success:true, data:tasks})
    //console.log(req.query);
     }

const getTasks= (req,res)=>{
    const id= req.params.id;

    const taskid = tasks.find((task)=>{
    return task.id === Number(id)})

    if(!taskid){
        return res.status(404).json({success:false, message:'task doesnt exist'})
    }
    return res.json({success:true, data:{taskid}})

  
}

const addTask= (req,res)=>{
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
}

const updateTask=(req,res)=>{
    const id=req.params.id;
      const {taskname,category,completed}= req.body;


      if(!taskname||!category||completed === undefined){
        if(typeof taskname & category !=="string"){
            return res.status(400).json({message:"taskname must be stirng"})
        }
        if(typeof completed !=="boolean"){
            return res.status(400).json({message:"taskname must be stirng"})
        }
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
}

const patchTask=(req,res)=>{
    const id= Number(req.params.id);
    const {taskname, category, completed}= req.body;

    const taskpartial=  tasks.find(task=>task.id === id);
     
    if(!taskpartial){
        return res.status(404).json({success:false, message:"task not found"})
    }
     if(taskname !== undefined){
        taskpartial.taskname= taskname;
    }
     if(category !== undefined){
        taskpartial.category= category; 
     }
     if(completed !== undefined){
        taskpartial.completed= completed; 
     }
res.status(200).json({success:true, data:{taskpartial}})
}

const deleteTask=(req,res)=>{
    const id = req.params.id;

    const taskindex= tasks.findIndex(taskindex=> taskindex.id === Number(id))

    if(taskindex<0){
       return res.status(404).json({success:false, message:"task doesnt exist"})
    }
    const deletedTask = tasks[taskindex];
    tasks.splice(taskindex,1)

    res.status(200).json({success:true, data:deletedTask})

}

module.exports={getall,getTasks, addTask, updateTask, patchTask, deleteTask};