//saving generated API USer
import mongoose from 'mongoose';

const payAPISchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        apiUserKey: {
            type: String
        },
        xReferenceId: {
            type: String
        },
        pesaNotificationID: {
            type: String,
        }
    }, { timestamps: true }
);

export default mongoose.model("payapis", payAPISchema)