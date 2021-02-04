const express = require('express');
const app = express();
const mongoose = require('mongoose');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    createParentPath: true
}));
const bodyParser = require('body-parser');


// parse application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
//app.use(bodyParser.json())


  // <<upload file>> to increase for big data
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


//Any one can access website (your IP) //allow proxy //* means all
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//data base connection
const db = mongoose.connect('mongodb://localhost/ReactStore',{
    useNewUrlParser: true ,
    useUnifiedTopology: true
})

let Tshirt = require('./model/tshirt')
let Category = require('./model/category')
let Order = require('./model/order')
let User = require('./model/user')



app.post('/Tshirt' , function (req,res){
    let NewTshirt = new Tshirt()
    NewTshirt.name = req.body.TshirtName ;
    NewTshirt.price = req.body.TshirtPrice ;
    NewTshirt.pic = req.body.TshirtPic ;
    NewTshirt.description = req.body.TshirtDescription ;
    NewTshirt.categoryId = req.body.TshirtCategory ;
    NewTshirt.availableItems = req.body.availableItems ;

    console.log(req.body.TshirtPic);

    NewTshirt.save(function(err,SavedTshirt){
        if (err) {
            console.log(err)
            res.status(500).send({error:"Coudn't add "})
        } else {
            res.send(SavedTshirt)
        }
    })
})

app.post('/Category' , function (req,res){
    let NewCategory = new Category()
    NewCategory.name = req.body.name ;

    NewCategory.save(function(err,SavedCategory){
        if (err) {
            res.status(500).send({error:"Coudn't add "})
        } else {
            res.send(SavedCategory)
        }
    })
})


app.post('/UploadPic' , function (req,res){

  console.log('in upload');
    console.log(req.files.file)
   console.log(req.files.file.name)


    try {
        if(!req.files.file) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let Pic = req.files.file;

            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            let newName = Date.now().toString()+Pic.name.substr(Pic.name.length - 5)

            console.log(newName)
            Pic.mv('./uploads/' + newName); //>>first part of path react

            //send response
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: newName, // >> send this path to react (second)
                    mimetype: Pic.mimetype,
                    size: Pic.size
                }
            });
            console.log('done')
        }
    } catch (err) {
           console.log(err)

        res.status(500).send(err);
    }

})

app.get('/Tshirts' , function (req,res){

    Tshirt.find({}).populate(
    {
        path: 'categoryId' ,
        model: 'Category' ,
        select : 'name'
    }
    ).exec(function(error,Tshirts){
        if (error){
            res.status(500).send({Error:"Coudn't get "})
        } else {

            res.send(Tshirts);
        }
    })
})

app.get('/Tshirt/:ID' , function (req,res){
    let tshirtId = req.params.ID
    Tshirt.find({_id:tshirtId},(err,tshirt)=>{
        if(err) {
            res.status(500).send({error:"Coudn't find "})
        } else {
            res.send(tshirt)
        }
    })
})


app.delete('/Tshirt/delete/:ID', function (req, res) {
  let tshirtId = req.params.ID

  Tshirt.findOne({_id: tshirtId}, function (err, tshirt) {
    if(err) {
      res.status(500).send({error: "Couldnt find"})
    }
    else {
      Tshirt.deleteOne({_id: tshirtId}, function (err, DeleteTshirt) {
        if(err) {
          res.status(500).send({error: "Couldnt delete"})
        }
        else {
          res.send(DeleteTshirt)
        }
      })
    }
  })
})

app.put('/Tshirt' , function (req,res){
    let tshirtId = req.body.TshirtId
    console.log(tshirtId)

    Tshirt.updateOne({_id :tshirtId} , {$set : {name : req.body.TshirtName ,
    price : req.body.TshirtPrice ,
    pic : req.body.TshirtPic ,
    description : req.body.TshirtDescription ,
    categoryId : req.body.TshirtCategory }} , (err,tshirt) => {
        if (err) {
            res.status(500).send({Error:'coudnt update'})
            console.log(err)
        } else {
            console.log(tshirt)
            res.send(tshirt)
        }
    }
)})
// important for upliad files
app.use('/uploads', express.static(process.cwd() + '/uploads'))


app.get('/Categories' , function (req,res){

    Category.find({} , function(error,Tshirts){
        if (error){
            res.status(500).send({Error:"Coudn't get "})
        } else {

            res.send(Tshirts);
        }
    })
})

app.put('/order' , function (req,res){
    let tshirtId = req.body.tshirtId
    let customerMobile = req.body.customerMobile

    Tshirt.findOne({_id :tshirtId} , function (err,student){

        if (err){
            res.status(500).send({error:"Coudn't find "})
        } else
        {
Tshirt.updateOne ({_id:  tshirtId} ,
                  {$inc : {availableItems : -1 }},
                 function (err , status ){
    if (err) {
                    res.status(500).send({error:"Coudn't update "})

    } else {

        let newOrder = new Order()
    newOrder.tshirtId = req.body.tshirtId ;
    newOrder.customerMobile = req.body.customerMobile ;

        newOrder.save(function(err,SavedOrder){
        if (err) {
            res.status(500).send({error:"Coudn't add "})
        } else {
            res.send(SavedOrder)
              }
            })
          }
        })
      }
    })
 })

 app.post('/user' , function (req,res){
   let newUser = User()
   newUser.userEmail= req.body.userEmail
   newUser.userPassword= md5(req.body.userPassword)
   newUser.userName= req.body.userName
   newUser.userIsAdmin= req.body.userIsAdmin
   newUser.userCreationDate= req.body.userCreationDate

   newUser.save(function(err, SavedUser) {
     if(err) {
       res.status(500).send(err)
       console.log(err);
     }
     else {
       res.send(SavedUser)
     }
   })
 })

 app.get('/users' , function (req,res){

   let token = req.body.token

   jwt.verify(token, process.env.secret_code_token, function(err, decoded) {
     if(decoded) {
       User.find({}, function (err, UserFound) {
         if(err) {
           re.send(500).send(err)
           console.log(err);
         }
         else {
           res.send(UserFound)
         }
       })
     }
     else
        {
         res.status(500).send({error: "no auth"})
       }
     })

   User.find({}, function(err, State) {
     if(err) {
       res.status(500).send(err)
       console.log(err);
     }
     else {
       res.send(State)
     }
   })
 });

 app.get('/login' , function (req,res){

   let Email = req.body.userEmail
   let Password = req.body.userPassword

   User.find({userEmail: Email}, function(err, UserFound) {
     if(err) {
       res.status(500).send(err)
       console.log(err);
     }
     else {

       if(UserFound[0].userPassword == md5(Password)) {
         let token = jwt.sign({ userEmail: UserFound[0].userEmail, userIsAdmin:UserFound[0].userIsAdmin }, process.env.secret_code_token, { expiresIn: '60'});
         console.log(token)

         let LoginRes = {
        //   UserDetails: UserFound,
           token: token,
           userEmail: UserFound[0].userEmail,
           userName: UserFound[0].userName,
           userIsAdmin: UserFound[0].userIsAdmin
         }

         res.send(LoginRes)
       }
       else {
         res.send({message: "password wrong"})
       }
     }
   })
 })

app.listen(4000, function() {
    console.log("Server is running on port 4000")
})
