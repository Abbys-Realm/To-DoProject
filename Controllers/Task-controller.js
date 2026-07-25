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
     if(!taskname||!category||completed===undefined){
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

const patchTask= async (req,res)=>{
    const id= Number(req.params.id);
    const {taskname, category, completed}= req.body;
     
   try{
    //to check if any field is provided 
    if(taskname===undefined&& category===undefined && completed===undefined){
        return res.status(400).json({
            success:false,
            message:"no field provided to update"
        })
    }
    //if a field is provided , it'll check its data type
     if(taskname !==undefined && typeof taskname!=="string" ) {
         return res.status(400).json({message:"taskname must be stirng"})
             }
     if(category  !==undefined && typeof category!=="string"){
            return res.status(400).json({message:"category must be stirng"})
     }
     if(completed  !==undefined && typeof completed !=="boolean" ){
         return res.status(400).json({message:"complete must be stirng"})
        }
         
         const fields=[]; //store the sql part of the code
         const values=[];//store the actual data

          if (taskname !== undefined) {
            fields.push(`taskname = $${values.length + 1}`);
            values.push(taskname);
        }

        if (category !== undefined) {
            fields.push(`category = $${values.length + 1}`);
            values.push(category);
        }

        if (completed !== undefined) {
            fields.push(`completed = $${values.length + 1}`);
            values.push(completed);
        }

        values.push(id);

        const query = `
            UPDATE tasks
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING *
        `;


        const result = await pool.query(query, values);


        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }


        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task: result.rows[0]
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


const deleteTask = async (req, res) => {
    const id = Number(req.params.id);

    try {
        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Task doesn't exist"
            });
        }

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
module.exports={getall,getTasks, addTask, updateTask, patchTask, deleteTask};