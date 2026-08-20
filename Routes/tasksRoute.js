const express= require ('express');
const router= express.Router();
const authMiddleware=require("../Middleware/authMiddleware")
const taskNotFound=require("../Middleware/taskMiddleware")

const{
    getall, getTasks,addTask,
    updateTask, patchTask, deleteTask
}= require('../Controllers/Task-controller');

//Routes for methods
router.get('/',authMiddleware,getall);
router.get('/:id',authMiddleware,taskNotFound,getTasks);
router.post('/',authMiddleware,addTask);
router.put('/update/:id',authMiddleware,taskNotFound,updateTask);
router.patch('/:id',authMiddleware,taskNotFound,patchTask);
router.delete('/delete/:id',authMiddleware,taskNotFound,deleteTask);


module.exports= router;