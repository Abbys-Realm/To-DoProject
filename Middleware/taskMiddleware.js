const pool= require('../Config/db')

const taskNotFound= async(req, res, next)=>{
  try  {
       const task_ID= Number(req.params.id)
       const userID= req.user.id;

       const result= await pool.query(
        `SELECT * FROM tasks WHERE id=$1 AND user_id=$2`,
        [task_ID,userID]
       )

       if(result.rows.length===0){
         return res.status(404).json({
            message: "Task not found"
         })
       }

       req.task= result.rows[0];

       next();
    }
    catch(error){
        next(error)
    }
}

module.exports= taskNotFound;