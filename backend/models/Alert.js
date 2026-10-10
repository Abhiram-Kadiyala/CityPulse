import mongoose from 'mongoose';
const schema=new mongoose.Schema({type:{type:String,required:true},title:{type:String,required:true},description:{type:String,default:''},location:{type:String,default:'Hyderabad'},priority:{type:String,enum:['Low','Medium','High','Critical'],default:'Medium'},status:{type:String,enum:['Active','Acknowledged','Resolved'],default:'Active'},acknowledgedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'}},{timestamps:true});
export default mongoose.model('Alert',schema);
