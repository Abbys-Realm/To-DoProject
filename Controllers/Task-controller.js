const { json } = require('express')
const pool= require("../Config/db")

const getall = async (req, res) => {
     const user_id=req.user.id;
        try {
      const {taskname,category,completed,sort,order}= req.query;
      let sortQuery = "";
      let conditions=["user_id=$1"];
      let values=[user_id];

        if (completed !== undefined ) {
            if(completed !== "true" &&completed !== "false") {
            return res.status(400).json({
                success: false,
                message: "completed must be true or false"}); }

            conditions.push(`completed=$${values.length+1}`);
            values.push(JSON.parse(completed))
        }
    if(category !== undefined) {
        if( !/^[A-Za-z ]+$/.test(category)){
        return res.status(400).json({
        success:false,
        message:"Category must be string"
      })
   }
    conditions.push(`category=$${values.length+1}`)
    values.push(category);
    }
 
    if(taskname !== undefined){
        if( !/^[A-Za-z ]+$/.test(taskname)){
         return res.status(400).json({
          success:false,
          message:"taskname must be a string"});}
         
        conditions.push(`taskname ILIKE $${values.length + 1}`);
            values.push(`%${taskname}%`);
        }
    if(sort){
    const allowedSort = ["taskname", "category", "completed"];

    if(!allowedSort.includes(sort)){
        return res.status(400).json({
            success:false,
            message:"Invalid sort field"
        });
    }
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    sortQuery = `ORDER BY ${sort} ${sortOrder}`;
}

    const query=`SELECT * FROM tasks WHERE ${conditions.join(" AND ")} ${sortQuery} `;

         const result = await pool.query(query, values);
        res.status(200).json({
            success:true,
            data:result.rows
        });
    } catch(error){

        console.log(error);
        res.status(500).json({
            success:false,
            message:"Server error"
        });
    }
};

const getTasks=async (req, res) => {
    try {
        const {id}= req.params;
        const user_id=req.user.id;
        const result = await pool.query("SELECT * FROM tasks WHERE id =$1 AND user_id=$2",[id,user_id]);

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
   
     try{
        const user_id= req.user.id;
        const {taskname, category,completed}= req.body;
        if(!taskname||!category||completed===undefined){
        return res.status(400).json({
            success:false,
            message:"each field is required"
        })
     }
        const result= await pool.query(`INSERT INTO tasks
            (taskname,category,completed,user_id)
            values($1,$2,$3,$4) RETURNING *`,
        [taskname,category,completed,user_id]
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
    const user_id= req.user.id;
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
            completed= $3 WHERE id= $4 
            AND user_id= $5 RETURNING *`,
        [taskname,category,completed,id,user_id]) 
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
    const userID= req.user.id;
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
        const IDplace= values.length;

        values.push(userID);
        const UIDplace=values.length

        const query = `
            UPDATE tasks
            SET ${fields.join(", ")}
            WHERE id = $${IDplace} 
            AND user_id=$${UIDplace}
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
    const userID= req.user.id;
    try {
        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
             AND user_id=$2
             RETURNING *`,
            [id,user_id]
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