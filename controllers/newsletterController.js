const { NewsletterSubscriber } = require('../models')

// @desc Subscribe
const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false })
    }

    const ipAddress = req.ip
    const userAgent = req.get('user-agent')

    const existing = await NewsletterSubscriber.findOne({
      email: email.toLowerCase().trim()
    })

    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active'
        existing.subscribedAt = new Date()
        existing.unsubscribedAt = null
        existing.ipAddress = ipAddress
        existing.userAgent = userAgent
        await existing.save()

        return res.json({ success: true, message: 'Resubscribed' })
      }

      return res.status(400).json({ success: false })
    }

    const subscriber = new NewsletterSubscriber({
      email: email.toLowerCase().trim(),
      ipAddress,
      userAgent
    })

    await subscriber.save()

    res.status(201).json({
      success: true,
      subscriber: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    })
  } catch (error) { next(error) }
}

// @desc Unsubscribe
const unsubscribe = async (req, res, next) => {
  try {
    const subscriber = await NewsletterSubscriber.findOne({
      email: req.body.email.toLowerCase()
    })

    if (!subscriber) return res.status(404).json({ success: false })

    if (subscriber.status === 'unsubscribed') {
      return res.status(400).json({ success: false })
    }

    subscriber.status = 'unsubscribed'
    subscriber.unsubscribedAt = new Date()

    await subscriber.save()

    res.json({ success: true })
  } catch (error) { next(error) }
}

// @desc Get all
const getAllSubscribers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query

    let filter = {}

    if (status) filter.status = status
    if (search) filter.email = { $regex: search, $options: 'i' }

    const skip = (page - 1) * limit
    const total = await NewsletterSubscriber.countDocuments(filter)

    const subscribers = await NewsletterSubscriber.find(filter)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    res.json({
      success: true,
      total,
      subscribers
    })
  } catch (error) { next(error) }
}

// @desc Stats
const getStats = async (req, res, next) => {
  try {
    const total = await NewsletterSubscriber.countDocuments()
    const active = await NewsletterSubscriber.countDocuments({ status: 'active' })
    const unsubscribed = await NewsletterSubscriber.countDocuments({ status: 'unsubscribed' })

    const recent = await NewsletterSubscriber.countDocuments({
      subscribedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: 'active'
    })

    res.json({
      success: true,
      stats: { total, active, unsubscribed, recent }
    })
  } catch (error) { next(error) }
}

// @desc Delete
const deleteSubscriber = async (req, res, next) => {
  try {
    await NewsletterSubscriber.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (error) { next(error) }
}

module.exports = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getStats,
  deleteSubscriber
}