const express= require ('express');
const router= express.Router();
const authMiddleware=require("../Middleware/authMiddleware")

const{
    getall, getTasks,addTask,
    updateTask, patchTask, deleteTask
}= require('../Controllers/Task-controller');

router.get('/',authMiddleware,getall);
router.get('/:id',authMiddleware,getTasks);
router.post('/add',authMiddleware,addTask);
router.put('/:id',authMiddleware,updateTask);
router.patch('/:id',authMiddleware,patchTask);
router.delete('/:id',authMiddleware,deleteTask);

module.exports= router;