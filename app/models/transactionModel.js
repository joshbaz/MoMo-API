import mongoose from 'mongoose';

const transactionAPISchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        transactionType: String,
        paymentType: String,
        payment_status_description: {
            type: String,
            default: "Pending"
        },
        status_reason: String,
        paidAmount: Number,
        purpose: String,
        amount: Number,
        currency: String,
        email: String,
        purpose: String,
        phonenumber: String,
        firstname: String,
        lastname: String,
        orderTrackingId: String,
       // createdDate: Date
    }, { timestamps: true }
);

export default mongoose.model("transactions", transactionAPISchema);
