
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

import { axiosInstance } from "@/lib/axiosInstance";
import { formatTime12Hour } from "@/lib/utils";

const emptyForm = {
  time: "",
  endTime: "",
  subject: "",
  description: "",
};

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MonthlyTaskPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const dateString = getDateString(selectedDate);

  const monthTitle = selectedDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const selectedDateTitle = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load selected date routines
  useEffect(() => {
    let active = true;

    const loadTasks = async () => {
      setLoading(true);

      try {
        const response = await axiosInstance.get("/daily-tasks", {
          params: { date: dateString },
        });

        if (active) {
          setTasks(response.data.tasks || []);
        }
      } catch (error) {
        console.error("Monthly tasks error:", error);

        if (active) {
          setTasks([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [dateString]);

  // Refresh tasks
  const refreshTasks = async () => {
    const response = await axiosInstance.get("/daily-tasks", {
      params: { date: dateString },
    });

    setTasks(response.data.tasks || []);
  };

  // Previous / Next month
  const changeMonth = (amount) => {
    setSelectedDate((previous) => {
      const next = new Date(
        previous.getFullYear(),
        previous.getMonth() + amount,
        1
      );

      return next;
    });
  };

  // Select date
  const handleDateChange = (event) => {
    const value = event.target.value;

    if (!value) return;

    const [year, month, day] = value.split("-").map(Number);

    setSelectedDate(new Date(year, month - 1, day));
  };

  // Add routine
  const handleAdd = () => {
    setEditingTask(null);
    setFormData({ ...emptyForm });
    setDialogOpen(true);
  };

  // Edit routine
  const handleEdit = (task) => {
    setEditingTask(task);

    setFormData({
      time: task.time || "",
      endTime: task.endTime || "",
      subject: task.subject || "",
      description: task.description || "",
    });

    setDialogOpen(true);
  };

  // Input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add / Update routine
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.time || !formData.endTime) {
      alert("Please select start and end times.");
      return;
    }

    if (formData.time >= formData.endTime) {
      alert("End time must be after start time.");
      return;
    }

    if (!formData.subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    const payload = {
      ...formData,
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      date: dateString,
    };

    try {
      setSaving(true);

      if (editingTask) {
        await axiosInstance.put(
          `/daily-tasks/${editingTask._id}`,
          payload
        );
      } else {
        await axiosInstance.post("/daily-tasks", payload);
      }

      await refreshTasks();

      setDialogOpen(false);
      setEditingTask(null);
      setFormData({ ...emptyForm });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to save routine."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete routine
  const handleDelete = async () => {
    if (!editingTask) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this routine?"
    );

    if (!confirmDelete) return;

    try {
      setSaving(true);

      await axiosInstance.delete(
        `/daily-tasks/${editingTask._id}`
      );

      await refreshTasks();

      setDialogOpen(false);
      setEditingTask(null);
      setFormData({ ...emptyForm });
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete routine."
      );
    } finally {
      setSaving(false);
    }
  };

  // Complete / Incomplete
  const toggleComplete = async (task) => {
    try {
      await axiosInstance.put(
        `/daily-tasks/${task._id}`,
        {
          completed: !task.completed,
        }
      );

      await refreshTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update routine."
      );
    }
  };

  const sortedTasks = [...tasks].sort((a, b) =>
    (a.time || "").localeCompare(b.time || "")
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        {/* Monthly Calendar */}
        <Card className="mb-4 bg-accent/30">
          <CardHeader>
            <div className="flex justify-between items-start gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Monthly Calendar
                  <span className="text-base">▦</span>
                </CardTitle>

                <CardDescription>
                  Select a date to view or edit routines
                </CardDescription>
              </div>

              <Button onClick={handleAdd}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Month navigation */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft />
              </Button>

              <p className="text-base font-semibold">
                {monthTitle}
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight />
              </Button>
            </div>

            {/* Date selection */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                type="date"
                value={dateString}
                onChange={handleDateChange}
                className="w-full sm:max-w-[240px]"
              />

              <Button
                variant="secondary"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selected date heading */}
        <div className="text-center mt-6 mb-5">
          <h2 className="text-lg font-semibold">
            {selectedDateTitle}
          </h2>
        </div>

        {/* Monthly progress */}
        <Card className="mb-4 bg-accent/30">
          <CardContent className="pt-5 pb-5">
            <div className="flex justify-between items-center gap-2">
              <h3 className="font-semibold">
                Daily Progress
              </h3>

              <span className="text-sm text-muted-foreground">
                {tasks.filter((task) => task.completed).length}/{tasks.length} Completed
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{
                  width: `${
                    tasks.length
                      ? (tasks.filter((task) => task.completed).length /
                          tasks.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Routine list */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading routines...
          </div>
        ) : sortedTasks.length > 0 ? (
          <ul className="space-y-4">
            {sortedTasks.map((task) => (
              <li key={task._id} className="flex gap-3 sm:gap-4">
                <div className="w-[70px] shrink-0 pt-3">
                  <p className="font-semibold text-sm">
                    {formatTime12Hour(task.time)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {formatTime12Hour(task.endTime)}
                  </p>
                </div>

                <Card
                  className="flex-1 min-w-0 bg-accent/30 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleEdit(task)}
                >
                  <CardHeader className="p-3">
                    <div className="flex justify-between items-center gap-3">
                      <CardTitle
                        className={`text-base ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.subject}
                      </CardTitle>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleComplete(task);
                        }}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="text-green-500" />
                        ) : (
                          <Circle />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {task.description && (
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <div className="size-40 bg-white rounded-full p-7 mx-auto mb-6">
              <img
                src="/Cup-Of-Coffee.svg"
                alt="No routines"
                className="w-full h-full object-contain"
              />
            </div>

            <h3 className="text-xl font-semibold">
              You seem free today! 😊
            </h3>

            <p className="text-muted-foreground mt-2">
              Click the "Add" button to create a new routine
            </p>
          </div>
        )}

        {/* Add / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!saving) setDialogOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Routine" : "Add New Routine"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Subject</Label>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Enter subject"
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                />
              </div>

              <div className="flex justify-end gap-2">
                {editingTask && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                )}

                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingTask
                    ? "Update Routine"
                    : "Add Routine"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default MonthlyTaskPage;
