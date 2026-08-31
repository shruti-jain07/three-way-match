import { Router } from "express";
import { login } from "../controllers/auth.controller.js";

const router = Router();
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Sign in
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: your-static-token
 */
router.post("/login", login);

export default router;