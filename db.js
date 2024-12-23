const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const ObjectId=mongoose.Types.ObjectId;
const enterSchema=new Schema({
    email:String,
    password:{type:String,unique:true},
    firstName:String,
    lastName:String
})
const eventSchema=new Schema({
    title:String,
    description:String,
    location:String,
    date: { type: Date, required: true }, 
    creatorId:ObjectId
});
const attendenceSchema=new Schema({
    attendee:Number,
    assignEvent:String

});
const trackerSchema=new Schema({
   taskdescription:String,
    date: { type: Date, required: true },
    event:String,
    task:String,
    attendee:Number,
});
const enterModule=mongoose.model("enter",enterSchema);
const eventModel=mongoose.model("event",eventSchema);
const attendenceModel=mongoose.model("attendence",attendenceSchema);
const trackerModel=mongoose.model("tracker",trackerSchema);
module.exports={
    enterModule,
    eventModel,
    attendenceModel,
    trackerModel
}