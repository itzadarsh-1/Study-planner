
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

const getWeekDates = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
};

const DailyTaskPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const dateString = getDateString(selectedDate);
  const weekDates = getWeekDates(selectedDate);
  // eslint-disable-next-line no-unused-vars
  const todayString = getDateString(new Date());

  const selectedDateTitle = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Load selected date routines from MongoDB
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
        console.error("Daily tasks error:", error);
        if (active) setTasks([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTasks();

    return () => {
      active = false;
    };
  }, [dateString]);

  const refreshTasks = async () => {
    const response = await axiosInstance.get("/daily-tasks", {
      params: { date: dateString },
    });

    setTasks(response.data.tasks || []);
  };

  // Previous / next week
  const changeWeek = (amount) => {
    setSelectedDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  };

  // Open add form
  const handleAdd = () => {
    setEditingTask(null);
    setFormData({ ...emptyForm });
    setDialogOpen(true);
  };

  // Open edit form
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add / update routine
  const handleSubmit = async (event) => {
    event.preventDefault();

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
        error.response?.data?.message || "Unable to save routine."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete routine
  const handleDelete = async () => {
    if (!editingTask) return;

    if (!window.confirm("Are you sure you want to delete this routine?")) {
      return;
    }

    try {
      setSaving(true);

      await axiosInstance.delete(
        `/daily-tasks/${editingTask._id}`
      );

      await refreshTasks();
      setDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to delete routine."
      );
    } finally {
      setSaving(false);
    }
  };

  // Complete / incomplete
  const toggleComplete = async (task) => {
    try {
      await axiosInstance.put(
        `/daily-tasks/${task._id}`,
        { completed: !task.completed }
      );

      await refreshTasks();
    } catch (error) {
      alert(
        error.response?.data?.message || "Unable to update routine."
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

        {/* Daily Calendar */}
        <Card className="mb-4 bg-accent/30">
          <CardHeader>
            <div className="flex justify-between items-start gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Daily Calendar
                  <span className="text-base">▦</span>
                </CardTitle>

                <CardDescription>
                  Select a day to view or edit routines
                </CardDescription>
              </div>

              <Button onClick={handleAdd}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Week navigation */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeWeek(-1)}
                aria-label="Previous week"
              >
                <ChevronLeft />
              </Button>

              <p className="text-sm text-muted-foreground">
                {weekDates[0].toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {" - "}
                {weekDates[6].toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeWeek(1)}
                aria-label="Next week"
              >
                <ChevronRight />
              </Button>
            </div>

            {/* Seven date boxes */}
            <div className="grid grid-cols-7 gap-1 sm:gap-3">
              {weekDates.map((day) => {
                const dayString = getDateString(day);
                const isSelected = dayString === dateString;

                return (
                  <button
                    key={dayString}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`rounded-xl min-h-[72px] sm:min-h-[82px] flex flex-col items-center justify-center gap-2 transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium">
                      {day.toLocaleDateString("en-IN", {
                        weekday: "short",
                      })}
                    </span>

                    <span className="text-lg sm:text-2xl font-semibold">
                      {day.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected date heading */}
        <div className="text-center mt-6 mb-5">
          <h2 className="text-lg font-semibold">
            {selectedDateTitle}
          </h2>
        </div>

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

export default DailyTaskPage;
