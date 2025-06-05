"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calender"
import {
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Search,
  Edit3,
  CalendarIcon,
  Tag,
  ArrowUp,
  ArrowDown,
  Minus,
  Download,
  Upload,
  Moon,
  Sun,
  RotateCcw,
  Filter,
  Clock,
  AlertTriangle,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: number
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  category: string
  dueDate?: Date
  createdAt: Date
  completedAt?: Date
}

type FilterType = "all" | "pending" | "completed" | "overdue"
type SortType = "created" | "priority" | "dueDate" | "alphabetical"

const CATEGORIES = ["Personal", "Work", "Shopping", "Health", "Learning", "Other"]
const PRIORITY_COLORS = {
  low: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700",
  medium: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700",
  high: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
}

export default function TaskManager() {
  // State management
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTaskCategory, setNewTaskCategory] = useState("Personal")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>()
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("created")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [validationError, setValidationError] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [showCompleted, setShowCompleted] = useState(true)
  const [undoStack, setUndoStack] = useState<Task[][]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("taskManagerTasks")
    const savedDarkMode = localStorage.getItem("taskManagerDarkMode")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }))
      setTasks(parsedTasks)
    } else {
      // Initial sample tasks
      const initialTasks: Task[] = [
        {
          id: 1,
          title: "Buy groceries",
          description: "Milk, bread, eggs, and vegetables",
          completed: false,
          priority: "medium",
          category: "Shopping",
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date("2024-01-15"),
        },
        {
          id: 2,
          title: "Read a book",
          description: "Finish reading 'The Pragmatic Programmer'",
          completed: true,
          priority: "low",
          category: "Learning",
          createdAt: new Date("2024-01-14"),
          completedAt: new Date("2024-01-16"),
        },
        {
          id: 3,
          title: "Complete project proposal",
          description: "Draft and review the Q2 project proposal",
          completed: false,
          priority: "high",
          category: "Work",
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          createdAt: new Date("2024-01-13"),
        },
        {
          id: 4,
          title: "Exercise for 30 minutes",
          completed: false,
          priority: "medium",
          category: "Health",
          createdAt: new Date("2024-01-12"),
        },
      ]
      setTasks(initialTasks)
    }

    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem("taskManagerTasks", JSON.stringify(tasks))
  }, [tasks])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("taskManagerDarkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Add task with enhanced functionality
  const addTask = () => {
    const trimmedTitle = newTaskTitle.trim()

    if (trimmedTitle === "") {
      setValidationError("Task title cannot be empty")
      return
    }

    if (trimmedTitle.length > 100) {
      setValidationError("Task title must be less than 100 characters")
      return
    }

    // Save current state for undo
    setUndoStack((prev) => [...prev.slice(-9), tasks])

    const newTask: Task = {
      id: Math.max(...tasks.map((t) => t.id), 0) + 1,
      title: trimmedTitle,
      description: newTaskDescription.trim() || undefined,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate,
      createdAt: new Date(),
    }

    setTasks([newTask, ...tasks])
    resetNewTaskForm()
  }

  const resetNewTaskForm = () => {
    setNewTaskTitle("")
    setNewTaskDescription("")
    setNewTaskPriority("medium")
    setNewTaskCategory("Personal")
    setNewTaskDueDate(undefined)
    setValidationError("")
  }

  // Enhanced task operations
  const toggleTaskCompletion = (id: number) => {
    setUndoStack((prev) => [...prev.slice(-9), tasks])
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task,
      ),
    )
  }

  const deleteTask = (id: number) => {
    setUndoStack((prev) => [...prev.slice(-9), tasks])
    setTasks(tasks.filter((task) => task.id !== id))
    setSelectedTasks((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const updateTask = (updatedTask: Task) => {
    setUndoStack((prev) => [...prev.slice(-9), tasks])
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
  }

  // Selection operations
  const toggleTaskSelection = (id: number) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectAllTasks = () => {
    setSelectedTasks(new Set(filteredAndSortedTasks.map((task) => task.id)))
  }

  const deselectAllTasks = () => {
    setSelectedTasks(new Set())
  }

  // Bulk operations
  const deleteSelectedTasks = () => {
    setUndoStack((prev) => [...prev.slice(-9), tasks])
    setTasks(tasks.filter((task) => !selectedTasks.has(task.id)))
    setSelectedTasks(new Set())
  }

  const markSelectedAsCompleted = () => {
    setUndoStack((prev) => [...prev.slice(-9), tasks])
    setTasks(
      tasks.map((task) => (selectedTasks.has(task.id) ? { ...task, completed: true, completedAt: new Date() } : task)),
    )
    setSelectedTasks(new Set())
  }

  // Undo functionality
  const undo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1]
      setTasks(previousState)
      setUndoStack((prev) => prev.slice(0, -1))
    }
  }

  // Import/Export functionality
  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tasks-${format(new Date(), "yyyy-MM-dd")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importTasks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target?.result as string)
          setUndoStack((prev) => [...prev.slice(-9), tasks])
          setTasks(
            importedTasks.map((task: any) => ({
              ...task,
              id: Math.max(...tasks.map((t) => t.id), 0) + task.id,
              createdAt: new Date(task.createdAt),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            })),
          )
        } catch (error) {
          alert("Invalid file format")
        }
      }
      reader.readAsText(file)
    }
  }

  // Filtering and sorting
  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (
          !task.title.toLowerCase().includes(query) &&
          !task.description?.toLowerCase().includes(query) &&
          !task.category.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Status filter
      switch (filter) {
        case "pending":
          return !task.completed
        case "completed":
          return task.completed
        case "overdue":
          return !task.completed && task.dueDate && task.dueDate < new Date()
        default:
          return showCompleted || !task.completed
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.getTime() - b.dueDate.getTime()
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    overdue: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < new Date()).length,
    highPriority: tasks.filter((t) => !t.completed && t.priority === "high").length,
  }

  const isOverdue = (task: Task) => {
    return !task.completed && task.dueDate && task.dueDate < new Date()
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "dark bg-slate-900" : "bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50"}`}
    >
      <div className="mx-auto max-w-6xl p-4">
        {/* Header */}
        <Card className="mb-6 border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Task Manager</CardTitle>
                  <p className="text-teal-100">Organize your life with powerful task management</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportTasks}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={importTasks} className="hidden" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDarkMode(!darkMode)}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Add new task section */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="task-title" className="text-teal-700 dark:text-teal-300 font-medium">
                    Task Title
                  </Label>
                  <Input
                    id="task-title"
                    placeholder="Enter a new task..."
                    value={newTaskTitle}
                    onChange={(e) => {
                      setNewTaskTitle(e.target.value)
                      if (validationError) setValidationError("")
                    }}
                    onKeyPress={(e) => e.key === "Enter" && addTask()}
                    className={`border-teal-200 focus:border-teal-500 focus:ring-teal-500 ${validationError ? "border-red-500" : ""}`}
                  />
                </div>
                <div>
                  <Label htmlFor="task-priority" className="text-teal-700 dark:text-teal-300 font-medium">
                    Priority
                  </Label>
                  <Select
                    value={newTaskPriority}
                    onValueChange={(value: "low" | "medium" | "high") => setNewTaskPriority(value)}
                  >
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low</SelectItem>
                      <SelectItem value="medium">🟡 Medium</SelectItem>
                      <SelectItem value="high">🔴 High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-category" className="text-teal-700 dark:text-teal-300 font-medium">
                    Category
                  </Label>
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="task-description" className="text-teal-700 dark:text-teal-300 font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="task-description"
                    placeholder="Add a description..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={2}
                    className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-teal-700 dark:text-teal-300 font-medium">Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-teal-200 hover:border-teal-300"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
                        {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={newTaskDueDate} onSelect={setNewTaskDueDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </div>
              )}

              <Button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                className="w-full md:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <div className="flex flex-wrap gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 border-teal-200 focus:border-teal-500 text-teal-500 bg-white"
                  />
                </div>

                {/* Filter */}
                <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
                  <SelectTrigger className="w-32 border-teal-200 text-teal-500 bg-white">
                    <Filter className="w-4 h-4 mr-2 bg-white text-teal-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className= "text-teal-500">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
                  <SelectTrigger className="w-40 border-teal-200 text-teal-500 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-completed"
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                    className="data-[state=checked]:bg-teal-600"
                  />
                  <Label htmlFor="show-completed" className="text-sm text-teal-700 dark:text-teal-300">
                    Show completed
                  </Label>
                </div>
              </div>
            </div>

            {/* Bulk operations */}
            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-lg border border-teal-200 dark:border-teal-700">
                <span className="text-sm font-medium text-teal-800 dark:text-teal-200">
                  {selectedTasks.size} task{selectedTasks.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markSelectedAsCompleted}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deleteSelectedTasks}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={deselectAllTasks}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Deselect All
                </Button>
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card className="text-center bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-teal-100">Total</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-xs text-emerald-100">Completed</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-xs text-cyan-100">Pending</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.overdue}</div>
                  <div className="text-xs text-rose-100">Overdue</div>
                </CardContent>
              </Card>
              <Card className="text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{stats.highPriority}</div>
                  <div className="text-xs text-purple-100">High Priority</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-teal-700 dark:text-teal-300 mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold">{Math.round((stats.completed / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-teal-100 dark:bg-teal-900/30 rounded-full h-4 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 h-4 rounded-full transition-all duration-700 ease-out shadow-lg"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bulk selection controls */}
            {filteredAndSortedTasks.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllTasks}
                  className="border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Select All
                </Button>
                {selectedTasks.size > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deselectAllTasks}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Deselect All
                  </Button>
                )}
              </div>
            )}

            {/* Tasks list */}
            <div className="space-y-3">
              {filteredAndSortedTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <Circle className="w-12 h-12 text-teal-400" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-teal-700 dark:text-teal-300">
                    {searchQuery
                      ? "No tasks match your search"
                      : filter === "overdue"
                        ? "No overdue tasks"
                        : filter === "completed"
                          ? "No completed tasks"
                          : filter === "pending"
                            ? "No pending tasks"
                            : "No tasks yet"}
                  </p>
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {searchQuery ? "Try adjusting your search terms" : "Add a task above to get started!"}
                  </p>
                </div>
              ) : (
                filteredAndSortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-lg ${
                      task.completed
                        ? "bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-700"
                        : isOverdue(task)
                          ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-700"
                          : "bg-white dark:bg-slate-800 border-teal-100 dark:border-teal-800 hover:border-teal-300 dark:hover:border-teal-600 shadow-sm"
                    }`}
                  >
                    {/* Selection checkbox */}
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />

                    {/* Completion checkbox */}
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 w-5 h-5 mt-1"
                    />

                    {/* Task content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <label
                            htmlFor={`task-${task.id}`}
                            className={`block cursor-pointer text-base font-medium transition-all duration-200 ${
                              task.completed
                                ? "text-teal-700 dark:text-teal-300 line-through opacity-75"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {task.title}
                          </label>

                          {task.description && (
                            <p
                              className={`text-sm mt-1 ${
                                task.completed
                                  ? "text-teal-600 dark:text-teal-400 opacity-75"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* Priority badge */}
                            <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs font-medium`}>
                              {task.priority === "high" && <ArrowUp className="w-3 h-3 mr-1" />}
                              {task.priority === "medium" && <Minus className="w-3 h-3 mr-1" />}
                              {task.priority === "low" && <ArrowDown className="w-3 h-3 mr-1" />}
                              {task.priority}
                            </Badge>

                            {/* Category badge */}
                            <Badge
                              variant="outline"
                              className="text-xs border-teal-200 text-teal-700 dark:border-teal-700 dark:text-teal-300"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {task.category}
                            </Badge>

                            {/* Due date */}
                            {task.dueDate && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  isOverdue(task)
                                    ? "border-rose-300 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20"
                                    : "border-cyan-300 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                                }`}
                              >
                                {isOverdue(task) && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {!isOverdue(task) && <Clock className="w-3 h-3 mr-1" />}
                                {format(task.dueDate, "MMM d")}
                              </Badge>
                            )}

                            {/* Completion date */}
                            {task.completed && task.completedAt && (
                              <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed {format(task.completedAt, "MMM d")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTask(task)}
                                className="text-gray-400 hover:text-teal-600 hover:bg-teal-50"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-teal-200">
                              <DialogHeader>
                                <DialogTitle className="text-teal-800 dark:text-teal-200">Edit Task</DialogTitle>
                              </DialogHeader>
                              <TaskEditForm task={task} onSave={updateTask} onCancel={() => setEditingTask(null)} />
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Task Edit Form Component
function TaskEditForm({
  task,
  onSave,
  onCancel,
}: {
  task: Task
  onSave: (task: Task) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || "")
  const [priority, setPriority] = useState(task.priority)
  const [category, setCategory] = useState(task.category)
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate)

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-title" className="text-teal-700 dark:text-teal-300 font-medium">
          Title
        </Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
        />
      </div>

      <div>
        <Label htmlFor="edit-description" className="text-teal-700 dark:text-teal-300 font-medium">
          Description
        </Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          rows={3}
          className="border-teal-200 focus:border-teal-500 focus:ring-teal-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-priority" className="text-teal-700 dark:text-teal-300 font-medium">
            Priority
          </Label>
          <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
            <SelectTrigger className="border-teal-200 focus:border-teal-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-category" className="text-teal-700 dark:text-teal-300 font-medium">
            Category
          </Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-teal-200 focus:border-teal-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-teal-700 dark:text-teal-300 font-medium">Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal border-teal-200 hover:border-teal-300"
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-teal-600" />
              {dueDate ? format(dueDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
          </PopoverContent>
        </Popover>
        {dueDate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDueDate(undefined)}
            className="mt-2 text-red-600 hover:bg-red-50"
          >
            Clear due date
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} className="border-gray-300 hover:bg-gray-50">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!title.trim()}
          className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
