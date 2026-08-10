const express= require ('express');
const router= express.Router();
const authMiddleware=require("../Middleware/authMiddleware")

const{
    getall, getTasks,addTask,
    updateTask, patchTask, deleteTask
}= require('../Controllers/Task-controller');

//Routes for methods
router.get('/',authMiddleware,getall);
router.get('/:id',authMiddleware,getTasks);
router.post('/add',authMiddleware,addTask);
router.put('/update/:id',authMiddleware,updateTask);
router.patch('/:id',authMiddleware,patchTask);
router.delete('/delete/:id',authMiddleware,deleteTask);


module.exports= router;