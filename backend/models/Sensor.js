import mongoose from 'mongoose';
const schema=new mongoose.Schema({type:{type:String,required:true},value:{type:Number,required:true},unit:{type:String,default:''},location:{type:String,default:'Hyderabad'},status:{type:String,enum:['Normal','Warning','Critical'],default:'Normal'},demo:{type:Boolean,default:true},observedAt:{type:Date,default:Date.now}},{timestamps:true});
export default mongoose.model('Sensor',schema);
