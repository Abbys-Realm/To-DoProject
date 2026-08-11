const {json}= require('express');
const pool = require("../Config/db")


const getSubtasks= async (req,res,next)=>{
    try{
        const task_id= Number(req.params.taskID)
        let condition=["task_id=$1"];
        let value=[task_id];
        const task_id = Number(req.params.taskID);
        const {title, completed, sort, order}= req.query;
       
        if (completed !== undefined ) {
            if(completed !== "true" &&completed !== "false") {
            return res.status(400).json({
                success: false,
                message: "completed must be true or false"}); }

            condition.push(`completed=$${value.length+1}`);
            value.push(JSON.parse(completed))
        }

       if(title !== undefined){
        if( !/^[A-Za-z ]+$/.test(title)){
         return res.status(400).json({
          success:false,
          message:"Title must be a string"});}
         
        condition.push(`taskname ILIKE $${value.length + 1}`);
            value.push(`%${taskname}%`);
        }    

        const result= await pool.query(`SELECT * FROM subtasks
                    WHERE  ${condition.join(" AND ")}`)
        res.status(200).json({
            success: true,
            data: result.rows
        })
    }    
    catch(error){
       next(error);
    }
}


const getSubtask= async (req,res, next)=>{
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
       next(error);
    }
}

const addSubtask=async (req,res,next)=>{
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
       next(error);
    }    
}

const updateSubtask= async (req,res, next)=>{
  try{
    const {title, complete, task_id}= req.body;
      if(!taskname||!category||completed === undefined)
      {
        return res.status(400).json({
            success:false,
            message:"every field is required"
        })
      }

      if(typeof title !=="string"){
            return res.status(400).json({message:"title must be string"})
        }
      if(typeof complete !=="string"){
            return res.status(400).json({message:"completed must be string"})
        }
    const result= await pool.query(`UPDATE subtask
        SET title=$1, completed=$2 WHERE task_id= $3
    RETURNING *`,[title,complete,task_id])
   res.status(200).json({
    success:true,
    data: result.rows[0]
   })
} catch(error){
       next(error);
}
        
  }



const patchSubtask= async (req,res,next)=>{
 try{
    const {title, completed}= req.body;
    const query=[]
    const values=[]
    if (title === undefined || completed === undefined) {
            return res.status(400).json({
                success: false,
                message: "title and completed are required"
            });
        }
        if (title === undefined || completed === undefined) {
            return res.status(400).json({
                success: false,
                message: "title and completed are required"
            });
        }
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "completed must be a boolean"
            });
        }

        const result = await pool.query(
            `UPDATE subtasks
             SET title = $1, completed = $2
             WHERE id = $3
             AND task_id = $4
             RETURNING *`,
            [title, completed, id, task_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Subtask not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Subtask updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

const updateSubtask = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const task_id = Number(req.params.taskID);

        const { title, completed } = req.body;

    if (title === undefined || completed === undefined) {
         return res.status(400).json({
            success: false,
            message: "title and completed are required"
            });
        }

    if (typeof title !== "string") {
         return res.status(400).json({
            success: false,
            message: "title must be a string"
            });
        }
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "completed must be a boolean"
            });
        }
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
     
    if(result.rows.length===0){
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
       next(error);
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
       next(error);
 }


}

module.exports={getSubtasks, getSubtask,addSubtask,
        updateSubtask, patchSubtask, deleteSubtask
 }