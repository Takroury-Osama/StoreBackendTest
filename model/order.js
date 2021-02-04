const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID 

let schema = mongoose.Schema;

let order = new schema ({
    tshirtId : { type : objectId , ref:'Tshirt'},
    datetime : { type : Date, default: Date.now },
    customerMobile : String 
})

module.exports = mongoose.model ('Order',order)





