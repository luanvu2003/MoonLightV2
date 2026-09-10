import mongoose, { Schema } from 'mongoose';
const ReviewSchema = new Schema({
    productId: {
        type: Schema.Types.Mixed,
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, 'Tên người đánh giá không được để trống'],
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        index: true
    },
    content: {
        type: String,
        required: [true, 'Nội dung nhận xét không được để trống'],
        trim: true
    },
    status: {
        type: String,
        default: 'approved',
        enum: ['approved']
    },
    shopReply: {
        type: String,
        default: ''
    },
    shopReplyBy: {
        type: String,
        default: ''
    },
    shopReplyRole: {
        type: String,
        default: ''
    },
    shopReplyDate: {
        type: Date
    }
}, {
    timestamps: true
});
export const Review = mongoose.model('Review', ReviewSchema);
//# sourceMappingURL=Review.js.map