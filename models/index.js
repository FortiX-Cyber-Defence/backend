// ❌ REMOVE sequelize import
// const { sequelize } = require('../config/database')

const User = require('./User')
const Service = require('./Service')
const Industry = require('./Industry')
const BlogPost = require('./BlogPost')
const JobApplication = require('./JobApplication')
const ServiceRequest = require('./ServiceRequest')
const ActivityLog = require('./ActivityLog')
const Contact = require('./Contact')
const DemoRequest = require('./DemoRequest')
const ClientAccessRequest = require('./ClientAccessRequest')
const NewsletterSubscriber = require('./NewsletterSubscriber')
const Inquiry = require('./Inquiry')

// ✅ No relationships needed in MongoDB

module.exports = {
  User,
  Service,
  Industry,
  BlogPost,
  JobApplication,
  ServiceRequest,
  ActivityLog,
  Contact,
  DemoRequest,
  ClientAccessRequest,
  NewsletterSubscriber,
  Inquiry
}