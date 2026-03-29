const { User } = require('../models')

// @desc Get all users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit

    const total = await User.countDocuments()

    const users = await User.find()
      .select('-password -twoFactorSecret')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      users
    })
  } catch (error) { next(error) }
}

// @desc Get single user
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret')

    if (!user) return res.status(404).json({ success: false })

    res.json({ success: true, user })
  } catch (error) { next(error) }
}

// @desc Update user
const updateUser = async (req, res, next) => {
  try {
    const fields = {}

    if (req.body.name) fields.name = req.body.name
    if (req.body.email) fields.email = req.body.email
    if (req.body.company) fields.company = req.body.company
    if (req.body.role) fields.role = req.body.role
    if (req.body.isActive !== undefined) fields.isActive = req.body.isActive
    if (req.body.clientStatus) fields.clientStatus = req.body.clientStatus

    const user = await User.findByIdAndUpdate(
      req.params.id,
      fields,
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret')

    if (!user) return res.status(404).json({ success: false })

    res.json({
      success: true,
      user
    })
  } catch (error) { next(error) }
}

// @desc Delete user
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ success: false })

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({ success: true })
  } catch (error) { next(error) }
}

// @desc Grant access
const grantServiceAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ success: false })

    if (user.role === 'user') {
      user.role = 'client'
      user.clientStatus = 'approved'
      user.approvedBy = req.user.id
      user.approvedAt = new Date()
      await user.save()
    }

    const updated = await User.findById(user._id)
      .select('-password -twoFactorSecret')

    res.json({ success: true, user: updated })
  } catch (error) { next(error) }
}

// @desc Revoke access
const revokeServiceAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) return res.status(404).json({ success: false })

    if (user.role === 'client') {
      user.role = 'user'
      user.clientStatus = null
      await user.save()
    }

    const updated = await User.findById(user._id)
      .select('-password -twoFactorSecret')

    res.json({ success: true, user: updated })
  } catch (error) { next(error) }
}

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  grantServiceAccess,
  revokeServiceAccess
}