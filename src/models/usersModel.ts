//import tools
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

//Create the Interface
export interface IUser extends mongoose.Document{
    email: string;
    password: string;
};

//Create the Schema
const Schema = mongoose.Schema;
const userSchema = new Schema<IUser>({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
});

//Pre save hook
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

//Create the model
const userModel = mongoose.model('user', userSchema) as any;

//export the model
export default userModel;