const {json}= require('express')
const pool = require("../Config/db")


const getSubtasks= async (req,res,next)=>{
    try{
        const task_id= Number(req.params.taskID)

        let condition=["task_id=$1"];
        let value=[task_id];
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
         
        condition.push(`title ILIKE $${value.length + 1}`);
            value.push(`%${title}%`);
        }    
        
        let sortQuery="";
        if(sort !== undefined){
            const allowedSort= ["title", "completed"];

            if(!allowedSort.includes(sort)){
                return res.status(400).json({
                    success:false,
                    message:"invalid sort field"
                })
            }
        if(order !== undefined && order !=="asc" && order !== "desc"){
            return res.status(400).json({
                success:false,
                message:"Use asc or"
            })
            const sortOrder= order ==="desc"? "DESC" :"ASC";

            sortQuery=`ORDER BY ${sort} ${sortOrder}`;
        }
    }
        const result= await pool.query(`SELECT * FROM subtasks
                    WHERE  ${condition.join(" AND ")}
                    ${sortQuery}`,
                     value)
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

        if(!title){
            return res.status(400).json({
                success:false,
                message: "provide a title"
            })
        }
        if(typeof title !== "string"){
            return res.status(400).json({
                success:false,
                message:"Title must be string"
            })
        }
        if (completed !== undefined && typeof completed !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "completed must be a boolean"
            });
        }
        const result= await pool.query(`INSERT INTO subtasks (task_id,title,completed)
                                     VALUES($1,$2,$3) RETURNING *`,
                                    [task_id, title, completed ?? false])
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
    const id= Number(req.params.id);
    const task_id= Number(req.params.taskID);
    const {title, completed}= req.body;
      if(title === undefined||completed === undefined)
      {
        return res.status(400).json({
            success:false,
            message:"Title and completed is required"
        })
      }

      if(typeof title !=="string"){
            return res.status(400).json({message:"title must be string"})
        }
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "completed must be a boolean"
            });
        }
    const result= await pool.query(`UPDATE subtasks
        SET title=$1, completed=$2 WHERE id= $3 AND task_id=$4
    RETURNING *`,[title,completed,id,task_id])

   res.status(200).json({
    success:true,
    message:"Updates successfully",
    data: result.rows[0]
   })
} catch(error){
       next(error);
}}


const patchSubtask= async (req,res,next)=>{
 try{
    const id= Number(req.params.id);
    const task_id= Number(req.params.taskID);

    const {title, completed}= req.body;

    const query=[]
    const value=[]
    if (title === undefined && completed === undefined) {
            return res.status(400).json({
                success: false,
                message: "Provide a field"
            });
        }
    if(title !== undefined){
        if(typeof title !== "string"){
            return res.status(400).json({
                success:false,
                message: "Title must be string"
            })
        }
        query.push(`title =$${value.length+1}`);
        value.push(title)
    }
    if(completed !== undefined){
        if(typeof completed !== "boolean"){
            return res.status(400).json({
                success:false,
                message: "Completed must be boolean"
            })
        }
    query.push(`completed =$${value.length+1}`);
        value.push(completed)
    }

    value.push(id)
    value.push(task_id)


        const result = await pool.query(
            `UPDATE subtasks
             SET ${query.join(", ")}
             WHERE id = $${value.length-1}
             AND task_id = $${value.length}
             RETURNING *`,
            value
        );

        res.status(200).json({
            success: true,
            message: "Subtask updated successfully",
            data: result.rows[0]
        });

    } catch (error) {
        next(error);
    }
};

const deleteSubtask= async (req,res)=>{
    try{
        const id= Number(req.params.id)
        const task_id= Number(req.params.taskID);
        const result= await pool.query(
            `DELETE FROM subtasks WHERE id=$1 AND task_id=$2 RETURNING *`,
            [id,task_id]
        )

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