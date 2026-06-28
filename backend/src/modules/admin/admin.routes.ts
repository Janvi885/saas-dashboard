import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { validate } from '../../middleware/validate'
import { setRole } from './admin.controller'
import { setRoleSchema } from './admin.validators'

const router = Router()

router.post('/set-role', authenticate, validate(setRoleSchema), setRole)

export default router
