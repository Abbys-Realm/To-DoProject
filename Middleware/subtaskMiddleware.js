const pool= require("../Config/db");

const subtaskNotFound= async (req, res, next)=>{
     try {
    const subtaskID= Number(req.params.id);
    const taskID= Number(req.params.taskID);
    const userID = req.user.id;


    const result= await pool.query(`SELECT subtasks.* 
        FROM subtasks
        JOIN tasks ON subtasks.task_id = tasks.id
        WHERE subtasks.id= $1
        AND subtasks.task_id=$2
        AND tasks.user_id=$3`,
    [subtaskID,taskID,userID])

    if(result.rows.length===0){
        return res.status(404).json({
            message:"Subtask not found"
        })
    }

    req.subtask= result.rows[0]

    next();
}
catch(error){
    next(error);
}
}

module.exports= subtaskNotFound;


