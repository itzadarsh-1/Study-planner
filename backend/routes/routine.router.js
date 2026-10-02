import express from "express";
import {
  addRoutine,
  getRoutines,
  getRoutineById,
  updateRoutine,
  deleteRoutine,
} from "../controllers/routine.controller.js";
import protectedRoute from "../middlewares/protected.middleware.js";

const router = express.Router();
router.use(protectedRoute);

router.post("/:day", addRoutine);
router.get("/", getRoutines);
router.get("/:id", getRoutineById);
router.put("/:day/:index", updateRoutine);
router.delete("/:day/:index", deleteRoutine);

export default router;
