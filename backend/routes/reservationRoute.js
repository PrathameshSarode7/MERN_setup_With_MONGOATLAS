import express from 'express';
import { sendReservation } from '../controller/reservation.js';
const router = express.Router();

router.post("/send");
export default router;