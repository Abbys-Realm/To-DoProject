const { json } = require('express')
const pool= require("../Config/db")

//Getting all tasks
const getall = async (req, res) => {
        try {
    //To uniquely identify users tasks to each one 
      const user_id=req.user.id;
      //values for filtering 
      const {taskname,category,completed,sort,order}= req.query;
      //extracting page and limit from a url query, 
      //Also automatically change it to integer and if not the same data type there's a default value
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      //Assigning the sort query to an empty string
      let sortQuery = "";
      //conditions and values contain the query and values respectively 
      let conditions=["user_id=$1"];
      let values=[user_id];
    
      //Validating condtions for completed,taskname, category
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
    //Sorting
    if(sort){
        //valid sort columns
    const allowedSort = ["taskname", "category", "completed"];
    if(!allowedSort.includes(sort)){
        return res.status(400).json({
            success:false,
            message:"Invalid sort field"
        });
    }
    //A variable the holds an order wheter to be : DESC /ASC
    const sortOrder = order === "desc" ? "DESC" : "ASC";
    sortQuery = `ORDER BY ${sort} ${sortOrder}`;
}
    //For page limit
   const offset= (page-1)*limit;
    let countValues=[...values]
    //checking validity of page and limit
if(isNaN(page) || page < 1 ||
   isNaN(limit) || limit < 1){
    return res.status(400).json({
        success:false,
        message:"Page and limit should be greater than 0"
    });
} 
    
    let query=`SELECT * FROM tasks WHERE ${conditions.join(" AND ")} ${sortQuery} `;
    { 
    query += ` LIMIT $${values.length+1} OFFSET $${values.length+2}`
         values.push(limit);
         values.push(offset);}
         const result = await pool.query(query, values);
        
    if (result.rows.length === 0) {
        return res.status(404).json({
        success: false,
        message: "Task not found"
    });
}
   //To return metadata about the available tasks
    const countQuery=`SELECT COUNT(*) AS total 
                      FROM tasks WHERE ${conditions.join(" AND ")}`;
    const countResult = await pool.query(countQuery, countValues);

    const totaltasks= Number(countResult.rows[0].total);
    const totalPages= Math.ceil(totaltasks/limit);
    const nextPage= page < totalPages;
    const prevPage= page>1;
    
    res.status(200).json({
            success:true,
            page,
            limit,
            totaltasks,
            totalPages,
            nextPage,
            prevPage,
            count: result.rows.length,
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

//getting a single tasks using a task ID
const getTasks=async (req, res) => {
    try {
        //extracting id from a url
        const {id}= req.params;
        const user_id=req.user.id;
        //A query to extract a single task based on ID and user's id
        const result = await pool.query(
        "SELECT * FROM tasks WHERE id =$1 AND user_id=$2",[id,user_id]);
        
        //If no rows match
    if(result.rows.length===0){
        return res.status(404).json({
            success:false,
            message:"task not found"
        })
    }
        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//To add new tasks
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
            return res.status(400).json({message:"taskname must be string"})
        }
        if(typeof category!=="string"){
            return res.status(400).json({message:"category must be string"})
        }
        if(typeof completed !=="boolean"){
            return res.status(400).json({message:"taskname must be string"})
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

    try {
    const id = Number(req.params.id);
    const user_id= req.user.id;
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