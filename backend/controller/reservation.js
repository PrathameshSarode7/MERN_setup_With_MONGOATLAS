import ErrorHandler from "../error/error.js";
import { Reservation } from '../models/reservationSchema.js';

export const sendReservation = async (req, res, next) => {
    const { firstName, lastName, email, phone, date, time } = req.body;

    if (!firstName || !lastName || !email || !phone || !date || !time) {
        return next(new ErrorHandler("Please fill in the full reservation form!", 400));
    }

    try {
        // Pass an object containing all the fields to the create method
        const reservationData = {
            firstName,
            lastName,
            email,
            phone,
            date,
            time,
        };

        await Reservation.create(reservationData); // Correct usage of create method

        res.status(200).json({
            success: true,
            message: "Reservation sent successfully",
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = Object.values(error.errors).map((err) => err.message);
            return next(new ErrorHandler(validationErrors.join(", "), 400));
        }
        return next(error);
    }
};
