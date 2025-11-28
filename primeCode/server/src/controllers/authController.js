import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const SALT_ROUNDS = 10

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existing = await User.findOne({ email })
  if (existing) {
    return res.status(400).json({ message: 'Email already registered' })
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await User.create({ name, email, password: hashed })
  const token = generateToken(user._id)

  res.status(201).json({ token, user: user.toProfileJSON() })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  const token = generateToken(user._id)
  res.json({ token, user: user.toProfileJSON() })
})
