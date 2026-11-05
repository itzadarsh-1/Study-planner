import mongoose from "mongoose";
import DailyTask from "../models/dailyTask.model.js";

const isValidDate = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
};

const isValidTime = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

const validateTask = ({ date, time, endTime, subject }) => {
  if (!isValidDate(date)) return "Please enter a valid date.";

  if (!isValidTime(time) || !isValidTime(endTime)) {
    return "Please enter valid start and end times.";
  }

  if (time >= endTime) {
    return "End time must be after start time.";
  }

  if (typeof subject !== "string" || !subject.trim()) {
    return "Subject is required.";
  }

  return null;
};

// GET: Tasks for a selected date
export const getDailyTasks = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({ message: "Invalid date." });
    }

    const tasks = await DailyTask.find({
      userId: req.user._id,
      date,
    }).sort({ time: 1 });

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    return res.status(500).json({ message: "Failed to fetch tasks." });
  }
};

// POST: Add a new task
export const addDailyTask = async (req, res) => {
  try {
    const { date, time, endTime, subject, description = "" } = req.body;

    const error = validateTask({ date, time, endTime, subject });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const overlap = await DailyTask.exists({
      userId: req.user._id,
      date,
      time: { $lt: endTime },
      endTime: { $gt: time },
    });

    if (overlap) {
      return res.status(409).json({
        message: "This time slot overlaps with an existing routine.",
      });
    }

    const task = await DailyTask.create({
      userId: req.user._id,
      date,
      time,
      endTime,
      subject: subject.trim(),
      description,
    });

    return res.status(201).json({
      message: "Task added successfully.",
      task,
    });
  } catch (error) {
    console.error("Add task error:", error);
    return res.status(500).json({ message: "Failed to add task." });
  }
};

// PUT: Update a task
export const updateDailyTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await DailyTask.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const date = req.body.date ?? task.date;
    const time = req.body.time ?? task.time;
    const endTime = req.body.endTime ?? task.endTime;
    const subject = req.body.subject ?? task.subject;
    const description = req.body.description ?? task.description;

    const error = validateTask({ date, time, endTime, subject });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const overlap = await DailyTask.exists({
      _id: { $ne: task._id },
      userId: req.user._id,
      date,
      time: { $lt: endTime },
      endTime: { $gt: time },
    });

    if (overlap) {
      return res.status(409).json({
        message: "This time slot overlaps with an existing routine.",
      });
    }

    task.date = date;
    task.time = time;
    task.endTime = endTime;
    task.subject = subject.trim();
    task.description = description;

    if (typeof req.body.completed === "boolean") {
      task.completed = req.body.completed;
    }

    await task.save();

    return res.status(200).json({
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({ message: "Failed to update task." });
  }
};

// DELETE: Delete a task
export const deleteDailyTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID." });
    }

    const task = await DailyTask.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({ message: "Failed to delete task." });
  }
};