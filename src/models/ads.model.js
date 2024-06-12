import mongoose from "mongoose";

const adsSchema = new mongoose.Schema({
    adsPosition:{
        type: String,
        required:true
    },
    adsUrl:{
        type:String,
        required:true
    },
    adsClickedCount:{
        type:Number,
        required:true,
        default:0
    },
    adsImage:{
        type:String,
        required:true
    }
})

export const Ads = mongoose.model("Ads", adsSchema);
