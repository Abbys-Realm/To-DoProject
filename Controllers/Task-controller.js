const pool = require('../Config/db');

//Allowed sort fields
const ALLOWED_SORT_FIELDS = [
  'id', 'taskname', 'category', 'completed',
  'priority', 'due_date', 'created_at', 'important',
];

// Valid values
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_FREQUENCIES = ['none', 'daily', 'weekly', 'monthly'];

//Normalize priority
function normalizePriority(val) {
  if (val === undefined || val === null) return 'medium';
  const normalized = String(val).toLowerCase().trim();
  return VALID_PRIORITIES.includes(normalized) ? normalized : null;
}

//Normalize frequency
function normalizeFrequency(val) {
  if (val === undefined || val === null) return null;
  const normalized = String(val).toLowerCase().trim();
  if (normalized === 'none' || normalized === '') return null;
  return VALID_FREQUENCIES.includes(normalized) ? normalized : null;
}

const syncSubtasks = async (task_id, completed) => {
    const result = await pool.query(
        `UPDATE subtasks
         SET completed = $1
         WHERE task_id = $2
         RETURNING *`,
        [completed, task_id]
    );
    return result.rows;
}; 
// GET /tasks
const getall = async (req, res, next) => {
  try {
    // User isolation
    const user_id = req.user.id;

    // Extract query params
    const { taskname, category, completed, priority, important, sort, order } = req.query;
    const page  = req.query.page  ? parseInt(req.query.page)  : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    // Validate page/limit early
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page and limit should be greater than 0',
      });
    }

    let sortQuery = '';
    let conditions = ['user_id=$1'];
    let values = [user_id];

    //  Filter- completed 
    if (completed !== undefined) {
      if (completed !== 'true' && completed !== 'false') {
        return res.status(400).json({ success: false, message: 'completed must be true or false' });
      }
      conditions.push(`completed=$${values.length + 1}`);
      values.push(JSON.parse(completed));
    }

    // Filter- category 
    if (category !== undefined) {
      if (!/^[A-Za-z ]+$/.test(category)) {
        return res.status(400).json({ success: false, message: 'Category must be a string' });
      }
      conditions.push(`category=$${values.length + 1}`);
      values.push(category);
    }

    // Filter- taskname (search) 
    if (taskname !== undefined) {
      if (!/^[A-Za-z0-9 ]+$/.test(taskname)) {
        return res.status(400).json({ success: false, message: 'taskname must be a string' });
      }
      conditions.push(`taskname ILIKE $${values.length + 1}`);
      values.push(`%${taskname}%`);
    }

    // Filter- priority
    if (priority !== undefined) {
      const p = String(priority).toLowerCase().trim();
      if (!VALID_PRIORITIES.includes(p)) {
        return res.status(400).json({ success: false, message: 'priority must be low, medium, or high' });
      }
      conditions.push(`priority=$${values.length + 1}`);
      values.push(p);
    }

    //Filter- important
    if (important !== undefined) {
      if (important !== 'true' && important !== 'false') {
        return res.status(400).json({ success: false, message: 'important must be true or false' });
      }
      conditions.push(`important=$${values.length + 1}`);
      values.push(JSON.parse(important));
    }

    // Sorting
    if (sort) {
      if (!ALLOWED_SORT_FIELDS.includes(sort)) {
        return res.status(400).json({
          success: false,
          message: `Invalid sort field. Allowed: ${ALLOWED_SORT_FIELDS.join(', ')}`,
        });
      }
      const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
      sortQuery = `ORDER BY ${sort} ${sortOrder}`;
    }

    //Pagination
    const offset = (page - 1) * limit;
    const countValues = [...values];

    let query = `SELECT * FROM tasks WHERE ${conditions.join(' AND ')} ${sortQuery}`;
    query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit);
    values.push(offset);

    const result = await pool.query(query, values);

    // Pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM tasks WHERE ${conditions.join(' AND ')}`;
    const countResult = await pool.query(countQuery, countValues);

    const totaltasks = Number(countResult.rows[0].total);
    const totalPages = Math.ceil(totaltasks / limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      totaltasks,
      totalPages,
      nextPage: page < totalPages,
      prevPage: page > 1,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

//GET /tasks/:id
const getTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'SELECT * FROM tasks WHERE id=$1 AND user_id=$2',
      [id, user_id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

//POST /tasks
const addTask = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Extract supported fields
    const {
      taskname,
      category,
      completed = false,
      description = null,
      priority: rawPriority,
      due_date = null,
      important = false,
      frequency: rawFrequency,
    } = req.body;

    // taskname remains required
    if (!taskname || !category) {
      return res.status(400).json({
        success: false,
        message: 'taskname and category are required',
      });
    }

    // Validate types
    if (typeof taskname !== 'string') {
      return res.status(400).json({ success: false, message: 'taskname must be a string' });
    }
    if (typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'category must be a string' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ success: false, message: 'completed must be a boolean' });
    }
    if (typeof important !== 'boolean') {
      return res.status(400).json({ success: false, message: 'important must be a boolean' });
    }

    // Normalize and validate priority
    const priority = normalizePriority(rawPriority);
    if (rawPriority !== undefined && rawPriority !== null && priority === null) {
      return res.status(400).json({
        success: false,
        message: 'priority must be low, medium, or high',
      });
    }

    // Normalize frequency
    const frequency = normalizeFrequency(rawFrequency);
    if (rawFrequency !== undefined && rawFrequency !== null && rawFrequency !== 'none' && rawFrequency !== '') {
      const check = String(rawFrequency).toLowerCase().trim();
      if (!VALID_FREQUENCIES.includes(check) && check !== '') {
        return res.status(400).json({
          success: false,
          message: 'frequency must be none, daily, weekly, or monthly',
        });
      }
    }

    // Validate due_date
    let dueDateValue = null;
    if (due_date !== null && due_date !== undefined && due_date !== '') {
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'due_date must be a valid date or null' });
      }
      dueDateValue = parsed.toISOString();
    }

    const result = await pool.query(
      `INSERT INTO tasks
        (taskname, category, completed, user_id, description, priority, due_date, important, frequency)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [taskname, category, completed, user_id, description, priority, dueDateValue, important, frequency]
    );

    res.status(201).json({ success: 'true', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

//PUT /tasks/update/:id 
const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user_id = req.user.id;

    const {
      taskname,
      category,
      completed,
      description = null,
      priority: rawPriority,
      due_date = null,
      important = false,
      frequency: rawFrequency,
    } = req.body;

    //taskname and category full update
    if (!taskname || !category || completed === undefined) {
      return res.status(400).json({ success: false, message: 'taskname, category, and completed are required' });
    }

    if (typeof taskname !== 'string') {
      return res.status(400).json({ success: false, message: 'taskname must be a string' });
    }
    if (typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'category must be a string' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ success: false, message: 'completed must be a boolean' });
    }
    if (typeof important !== 'boolean') {
      return res.status(400).json({ success: false, message: 'important must be a boolean' });
    }

    const priority = normalizePriority(rawPriority);
    if (rawPriority !== undefined && rawPriority !== null && priority === null) {
      return res.status(400).json({ success: false, message: 'priority must be low, medium, or high' });
    }

    const frequency = normalizeFrequency(rawFrequency);

    let dueDateValue = null;
    if (due_date !== null && due_date !== undefined && due_date !== '') {
      const parsed = new Date(due_date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'due_date must be a valid date or null' });
      }
      dueDateValue = parsed.toISOString();
    }

    const result = await pool.query(
      `UPDATE tasks SET
        taskname=$1, category=$2, completed=$3,
        description=$4, priority=$5, due_date=$6, important=$7, frequency=$8
       WHERE id=$9 AND user_id=$10
       RETURNING *`,
      [taskname, category, completed, description, priority, dueDateValue, important, frequency, id, user_id]
    );
    
    if(completed=== true){
      await pool.query(
        `UPDATE subtasks 
        SET completed= true
        WHERE task_id=$1`,[id]
      )
    }


    if (completed !== undefined) {
    await syncSubtasks(id, completed);
}
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
   next(error)
  }
};

//PATCH /tasks/:id 
const patchTask = async (req, res, next) => {
  const id = Number(req.params.id);
  const userID = req.user.id;

  try {
    const {
      taskname,
      category,
      completed,
      description,
      priority: rawPriority,
      due_date,
      important,
      frequency: rawFrequency,
    } = req.body;

    // At least one field must be provided
    if (
      taskname === undefined &&
      category === undefined &&
      completed === undefined &&
      description === undefined &&
      rawPriority === undefined &&
      due_date === undefined &&
      important === undefined &&
      rawFrequency === undefined
    ) {
      return res.status(400).json({ success: false, message: 'No field provided to update' });
    }

    // Validate supplied field
    if (taskname !== undefined && typeof taskname !== 'string') {
      return res.status(400).json({ success: false, message: 'taskname must be a string' });
    }
    if (category !== undefined && typeof category !== 'string') {
      return res.status(400).json({ success: false, message: 'category must be a string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ success: false, message: 'completed must be a boolean' });
    }
    if (important !== undefined && typeof important !== 'boolean') {
      return res.status(400).json({ success: false, message: 'important must be a boolean' });
    }

    let priorityVal;
    if (rawPriority !== undefined) {
      priorityVal = normalizePriority(rawPriority);
      if (priorityVal === null) {
        return res.status(400).json({ success: false, message: 'priority must be low, medium, or high' });
      }
    }

    let frequencyVal;
    if (rawFrequency !== undefined) {
      frequencyVal = normalizeFrequency(rawFrequency);
        if (rawFrequency !== null && rawFrequency !== '' && rawFrequency !== 'none') {
        const check = String(rawFrequency).toLowerCase().trim();
        if (!VALID_FREQUENCIES.includes(check)) {
          return res.status(400).json({
            success: false,
            message: 'frequency must be none, daily, weekly, or monthly',
          });
        }
      }
    }

    let dueDateVal;
    if (due_date !== undefined) {
      if (due_date === null || due_date === '') {
        dueDateVal = null;
      } else {
        const parsed = new Date(due_date);
        if (isNaN(parsed.getTime())) {
          return res.status(400).json({ success: false, message: 'due_date must be a valid date or null' });
        }
        dueDateVal = parsed.toISOString();
      }
    }

    const fields = [];
    const values = [];
    //Adding a provided field to fields and values array
    if (taskname !== undefined)   
     { fields.push(`taskname=$${values.length + 1}`);    values.push(taskname); }
    if (category !== undefined)    
      { fields.push(`category=$${values.length + 1}`);    values.push(category); }
    if (completed !== undefined)   
      { fields.push(`completed=$${values.length + 1}`);  
        values.push(completed)
             if (completed === true) {
       fields.push(`completed_at=NOW()`)
        } else {
       fields.push(`completed_at=NULL`)
        }
        } 
    if (description !== undefined) 
      { fields.push(`description=$${values.length + 1}`); values.push(description); }
    if (priorityVal !== undefined) 
      { fields.push(`priority=$${values.length + 1}`);    values.push(priorityVal); }
    if (dueDateVal !== undefined) 
       { fields.push(`due_date=$${values.length + 1}`);    values.push(dueDateVal); }
    if (important !== undefined)  
       { fields.push(`important=$${values.length + 1}`);   values.push(important); }
    if (frequencyVal !== undefined)
      { fields.push(`frequency=$${values.length + 1}`);   values.push(frequencyVal); }

    const IDplace  = values.length + 1;
    const UIDplace = values.length + 2;
    values.push(id);
    values.push(userID);

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id=$${IDplace} AND user_id=$${UIDplace}
      RETURNING *
    `;
    
   const result = await pool.query(query, values);

    if (completed !== undefined) {
  await pool.query(
    `UPDATE subtasks
     SET completed = $1
     WHERE task_id = $2`,
    [completed, id]
  );
}

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: result.rows[0],
    });
  } catch (error) {
    next(error)
  }
};

// DELETE /tasks/delete/:id 
const deleteTask = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user_id = req.user.id;

    const result = await pool.query(
      `DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING *`,
      [id, user_id]
    );

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getall, getTasks, addTask, updateTask, patchTask, deleteTask };