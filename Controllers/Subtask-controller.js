const {json}= require('express');
const pool = require("../Config/db")


const getSubtasks= async (req,res)=>{
    try{
        const task_id = Number(req.params.taskID);
        const {title, completed, sort, order}= req.query;
        const result= await pool.query(`SELECT * FROM subtasks
                    WHERE task_id = $1`, [task_id])
        res.status(200).json({
            success: true,
            data: result.rows
        })
    }    
    catch(error){
         console.log(error)
         res.status(500).json({
            success: false,
            message: "Server Error"
         })
    }
}


const getSubtask= async (req,res)=>{
    try{
        const id= Number(req.params.id);
        const task_id = Number(req.params.taskID);

        const result= await pool.query(`SELECT * FROM subtasks WHERE id=$1 AND task_id=$2 `,[id,task_id])
        
        if(result.rows.length===0){
        return res.status(404).json({
        success:false,
        message:"subtask not found"})
        }
       res.status(200).json({
        success: true,
        data: result.rows[0]
       })
    }
    catch(error){
         console.log(error)
         res.status(500).json({
            success: false,
            message: "Server Error"
         })
    }
}

const addSubtask=async (req,res)=>{
    try{
        const task_id= Number(req.params.taskID);
        const{title,completed}=req.body;
        const result= await pool.query(`INSERT INTO subtask (task_id,title,completed)
                                     VALUES($1,$2.$3) RETURNING *`,
                                    [title, task_id, completed ?? false])
        res.status(201).json({
            success:true, 
            data:result.rows[0]
        })
    }
    catch(error){
         console.log(error)
         res.status(500).json({
            success: false,
            message: "Server Error"
         })
    }    
}

const updateSubtask= async (req,res)=>{
  try{
    const {title, complete, task_id}= req.body;
    const result= await pool.query(`UPDATE subtask
        SET title=$1, completed=$2 WHERE task_id= $3
    RETURNING *`,[title,completed,task_id])
   res.status(200).json({
    success:true,
    data: result.rows[0]
   })
} catch(error){
             console.log(error)
         res.status(500).json({
            success: false,
            message: "Server Error"
         })
}
        
  }



const patchSubtask= async (req,res)=>{
 try{
    const {title, completed}= req.body;
    const query=[]
    const values=[]
     
    if(title !== undefined){
        query.push(`title= $${values.length +1}`)
        values.push(title)
    }
    if( completed !== undefined){
        query.push(`completed= $${values.length+1}`)
        values.push(completed)
    }
    if(query.length===0){
        return res.status(400).json({
            success:true,
            message:"no field provided to update"
        })
    }

    const result= `UPDATE substack SET ${query.join(", ")}
                 WHERE id= $${values.length} RETURNING *`;
     
    if(result.rows.llength===0){
        return res.status(404).json({
            success:false,
            message:"no subtask found"
        })
    }

    res.status(200).json({
       success:true,
       data: result.rows[0]
    })
 } catch(error){
    res.status(500).json({
        success:false,
        message:"server error"
    })
 }

}



const deleteSubtask= async (req,res)=>{
    try{
        const id= Number(req.params.id)
        const task_id= Number(req.params.taskID);
        const result= await pool.query(
            `DELETE FROM subtasks WHERE id=$1 AND task_id=$2 RETURNING *`,
            [id,task_id]
        )

        if(result.rows.length===0){
            return res.status(404).json({
                success:false,
                message:"Subtask not found"
            })
        }
       res.status(200).json({
        success:true,
        data: result.rows[0]
       })
    } catch(error){
    res.status(500).json({
        success:false,
        message:"server error"
    })
 }


}

module.exports={getSubtasks, getSubtask,addSubtask,
        updateSubtask, patchSubtask, deleteSubtask
 }