import { Task } from '../models/Task.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listTasks = asyncHandler(async (req, res) => {
  const { search = '', status } = req.query
  const filters = { owner: req.user._id }

  if (status) {
    filters.status = status
  }

  if (search) {
    filters.$text = { $search: search }
  }

  const tasks = await Task.find(filters).sort({ updatedAt: -1 })
  res.json({ tasks: tasks.map((task) => task.toResponseJSON()) })
})

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user._id })
  res.status(201).json({ task: task.toResponseJSON() })
})

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const task = await Task.findOne({ _id: id, owner: req.user._id })

  if (!task) {
    return res.status(404).json({ message: 'Task not found' })
  }

  Object.assign(task, req.body)
  await task.save()
  res.json({ task: task.toResponseJSON() })
})

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const task = await Task.findOne({ _id: id, owner: req.user._id })

  if (!task) {
    return res.status(404).json({ message: 'Task not found' })
  }

  await task.deleteOne()
  res.json({ message: 'Task removed' })
})
