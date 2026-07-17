const express= require ('express');
const router= express.Router();


const{
    getall, getTasks,addTask,
    updateTask, patchTask, deleteTask
}= require('../Controllers/Task-controller')

router.get('/',getall);
router.get('/:id',getTasks);
router.post('/add',addTask);
router.put('/:id',updateTask);
router.patch('/:id',patchTask);
router.delete('/:id',deleteTask);

module.exports= router;