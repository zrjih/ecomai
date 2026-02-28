const express = require('express');
const { asyncHandler } = require('../middleware/async-handler');
const { validateBody } = require('../middleware/validate');
const authService = require('../services/auth');

const router = express.Router();

router.post('/login', validateBody({
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
}), asyncHandler(async (req, res) => {
  const tokens = await authService.login(req.body.email, req.body.password);
  res.json(tokens);
}));

router.post('/refresh', validateBody({
  refreshToken: { required: true, type: 'string' },
}), asyncHandler(async (req, res) => {
  const tokens = await authService.refresh(req.body.refreshToken);
  res.json(tokens);
}));

router.post('/logout', validateBody({
  refreshToken: { required: true, type: 'string' },
}), asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken);
  res.json(result);
}));

module.exports = router;