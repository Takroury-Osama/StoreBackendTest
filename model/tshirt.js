const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID 

let schema = mongoose.Schema;

let tshirt = new schema ({
    name : String ,
    price : Number , 
    description:String,
    pic:String,
    categoryId : { type : objectId , ref:'Category'},
    availableItems : Number
})

module.exports = mongoose.model ('Tshirt',tshirt)