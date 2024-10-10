import mongoose from 'mongoose';
import validator from 'validator';

const reservationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: [3, 'First name must contain at least 3 chars'],
    maxLength: [30, 'First name cannot exceed 30 chars'],
  },
  lastName: {
    type: String,
    required: true,
    minLength: [3, 'Last name must contain at least 3 chars'],
    maxLength: [30, 'Last name cannot exceed 30 chars'],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Provide a valid email'],
  },
  phone: {
    type: String, // Store the phone number as a string
    required: true,
    minLength: [11, 'Phone must contain at least 11 chars'],
    maxLength: [11, 'Phone cannot exceed 11 chars'],
  },
  time: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

export const Reservation = mongoose.model('Reservation', reservationSchema);
