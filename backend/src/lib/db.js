import mongoose from "mongoose";

export const connectDB=async()=>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to MongoDB ${conn.connection.host}`)
    } catch (error) {
        console.log('Failed to connect MongoDB',error);
        process.exit(1); // 1 is Failure, 0 is Success Message
    }
}