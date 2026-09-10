import mongoose, { Schema } from 'mongoose';
const LogSchema = new Schema({
    time: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});
export const Log = mongoose.model('Log', LogSchema);
//# sourceMappingURL=Log.js.map