const Task = require('../models/Task');
const Application = require('../models/Application');

// Create task
const createTask = async (req, res) => {
  try {
    const { title, description, difficulty, category, taskType, applicationId } = req.body;

    const task = new Task({
      title,
      description,
      company: req.userId,
      difficulty,
      category,
      taskType,
    });

    await task.save();

    // If this is a recovery task, add it to the application
    if (applicationId && taskType === 'recovery') {
      await Application.findByIdAndUpdate(applicationId, {
        $push: { rejectionRecoveryTasks: task._id },
      });
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const { difficulty, taskType, category } = req.query;
    let filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (taskType) filter.taskType = taskType;
    if (category) filter.category = category;

    const tasks = await Task.find(filter).populate('company', 'companyName');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate('company');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task', error: err.message });
  }
};

// Submit task
const submitTask = async (req, res) => {
  try {
    const { submissionFile } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if already submitted
    const existingSubmission = task.submissions.find(
      (sub) => sub.student.toString() === req.userId
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'Task already submitted' });
    }

    // Add submission
    task.submissions.push({
      student: req.userId,
      submissionDate: new Date(),
      submissionFile,
    });

    await task.save();

    res.json({ message: 'Task submitted successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting task', error: err.message });
  }
};

// Review submission
const reviewSubmission = async (req, res) => {
  try {
    const { feedback, score } = req.body;
    const task = await Task.findById(req.params.taskId);

    const submission = task.submissions.find(
      (sub) => sub._id.toString() === req.params.submissionId
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.feedback = feedback;
    submission.score = score;

    await task.save();

    res.json({ message: 'Submission reviewed', task });
  } catch (err) {
    res.status(500).json({ message: 'Error reviewing submission', error: err.message });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  submitTask,
  reviewSubmission,
};
