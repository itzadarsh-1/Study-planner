import express from "express";

import protectedRoute from "../middlewares/protected.middleware.js";

import {
  getDailyTasks,
  addDailyTask,
  updateDailyTask,
  deleteDailyTask,
} from "../controllers/dailyTask.controller.js";

const router = express.Router();

// All routes require login
router.use(protectedRoute);

// Get tasks by date
router.get("/", getDailyTasks);

// Add task
router.post("/", addDailyTask);

// Update task
router.put("/:id", updateDailyTask);

// Delete task
router.delete("/:id", deleteDailyTask);

export default router;