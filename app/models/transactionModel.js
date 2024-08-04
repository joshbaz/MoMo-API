import mongoose from 'mongoose';

const transactionAPISchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        transactionType: string,
        paymentType: string,
        amount: string,
        currency: string,
        email: string,
        purpose: string,
        phonenumber: string,
        firstname: string,
        lastname: string,
        createdDate: Date
    }, { timestamps: true }
);

export default mongoose.model("transactions", transactionAPISchema);
