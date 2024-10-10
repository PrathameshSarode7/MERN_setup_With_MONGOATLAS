import mongoose from 'mongoose';

export const dbConnection =()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"RESAURT",

    })
    .then(()=>{
        console.log("connect with db");
    })
    .catch((err)=>{
        console.log("error occure while connection with db");
    });
};