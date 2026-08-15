const express= require('express')
//mergeparams: tells the substack router to keep url parameters
//that were defined in the parent router/app
const route = express.Router({mergeParams :true})
const authMiddleware= require("../Middleware/authMiddleware")


const {getSubtasks, getSubtask,addSubtask,
        updateSubtask, patchSubtask, deleteSubtask
}= require('../Controllers/Subtask-controller')


route.get('/',authMiddleware, getSubtasks);
route.get('/:id',authMiddleware,getSubtask);
route.post('/add',authMiddleware,addSubtask);
route.put('/update/:id',authMiddleware,updateSubtask);
route.patch('/partial/:id',authMiddleware,patchSubtask);
route.delete('/delete/:id',authMiddleware,deleteSubtask);


module.exports = route;