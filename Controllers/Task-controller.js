const { json } = require('express');
const tasks= require('../DATA/data');
const pool= require("../Config/db")

const getall = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks");

        res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

const getTasks=async (req, res) => {

    const {id}= req.params;
    try {
        const result = await pool.query("SELECT * FROM tasks WHERE id =$1",[id]);

        res.status(200).json({
            success: true,
            data: result.rows,
        });

    if(result.rows.length===0){
        return res.status(404).json({
            success:false,
            message:"task not found"
        })
    }

  res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addTask= async (req,res)=>{
     const {taskname, category,completed}= req.body;
     if(!taskname||!category||completed==undefined){
        return res.status(400).json({
            success:false,
            message:"each field is required"
        })
     }
     try{
        const result= await pool.query(`INSERT INTO tasks
            (taskname,category,completed)
            values($1,$2,$3) RETURNING *`,
        [taskname,category,completed]
    )
     
    res.status(201).json({success:"true", data:result.rows[0]});
}
   catch(error){
    console.log(error);
    res.status(500).json({
        success:false,
        message:"server error"
    })
   }
}

const updateTask= async (req,res)=>{
    const id=req.params.id;
      const {taskname,category,completed}= req.body;
      if(!taskname||!category||completed === undefined)
      {
        return res.status(400).json({
            success:false,
            message:"every field is required"
        })
      }
        
        if(typeof taskname   !=="string"){
            return res.status(400).json({message:"taskname must be stirng"})
        }
        if(typeof category!=="string"){
            return res.status(400).json({message:"category must be stirng"})
        }
        if(typeof completed !=="boolean"){
            return res.status(400).json({message:"taskname must be stirng"})
        }
         
    
     try 
     {
        const result= await pool.query(`UPDATE tasks SET
            taskname=$1,
            category=$2,
            completed= $3 WHERE id= $4 RETURNING *`,
        [taskname,category,completed,id]) 
        if(result.rows.length===0){
            return res.status(404).json({
                success:false,
                message:`no task with the id`})
        }
        res.status(200).json({
            success:true,
            data:result.rows[0]
        })
        }catch(error){
            console.log(error);
            res.status(500).json({
        success:false,
        message:"server error"
    })
        }

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