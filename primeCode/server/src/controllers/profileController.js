import { asyncHandler } from '../utils/asyncHandler.js'

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toProfileJSON() })
})

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio = '' } = req.body

  req.user.name = name
  req.user.bio = bio
  await req.user.save()

  res.json({ user: req.user.toProfileJSON() })
})
