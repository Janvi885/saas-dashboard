import { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler'
import { success } from '../../utils/apiResponse'
import * as adminService from './admin.service'
import type { SetRoleInput } from './admin.validators'

export const setRole = asyncHandler(async (req: Request, res: Response) => {
  const { uid, role } = req.body as SetRoleInput

  const result = await adminService.setUserRole({
    uid,
    role,
    callerUid: req.user!.uid,
    callerRole: req.user!.role,
    callerEmail: req.user?.email,
  })

  success(res, result)
})
