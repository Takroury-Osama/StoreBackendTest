require('dotenv').config()
const mongoose = require('mongoose');

const objectId = mongoose.Schema.Types.ObjectID

let schema = mongoose.Schema;
let encrypt = require('mongoose-encryption');

let user = new schema ({

  userEmail: String,
  userPassword: String,
  userName: String,
  userIsAdmin: Boolean,
  userCreationDate: {type: Date, default: Date.now}
})

let secret = process.env.secret_code;
user.plugin(encrypt, { secret: secret, encryptedFields: ['userPassword']});

module.exports = mongoose.model ('User',user);
