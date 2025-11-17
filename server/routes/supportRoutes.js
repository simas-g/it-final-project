import express from 'express'
import { uploadSupportTicket } from '../controllers/supportController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/support/upload-ticket', authenticateToken, uploadSupportTicket)

export default router

