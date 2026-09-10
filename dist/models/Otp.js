import mongoose, { Schema } from 'mongoose';
const OtpSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // Tự động xóa khỏi MongoDB sau 5 phút (300 giây)
    }
});
export const Otp = mongoose.model('Otp', OtpSchema);
//# sourceMappingURL=Otp.js.map