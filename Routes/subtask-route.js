const express= require('express')
//mergeparams: tells the substack router to keep url parameters
//that were defined in the parent router/app
const route = express.Router({mergeParams :true})
const authMiddleware= require("../Middleware/authMiddleware")
const subtaskNotFound= require("../Middleware/subtaskMiddleware")


const {getSubtasks, getSubtask,addSubtask,
        updateSubtask, patchSubtask, deleteSubtask
}= require('../Controllers/Subtask-controller')


route.get('/',authMiddleware, getSubtasks);
route.get('/:id',authMiddleware,subtaskNotFound,getSubtask);
route.post('/add',authMiddleware,subtaskNotFound,addSubtask);
route.put('/update/:id',authMiddleware,subtaskNotFound,updateSubtask);
route.patch('/partial/:id',authMiddleware,subtaskNotFound,patchSubtask);
route.delete('/delete/:id',authMiddleware,subtaskNotFound,deleteSubtask);


module.exports = route;