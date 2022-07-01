const express = require("express") 
const bodyParser = require("body-parser")
const mongoose = require("mongoose") ;
const _ = require("lodash") ;


const app = express() ;
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true})) ;
app.use(express.static("public")) ;



// create new database inside mongodb and connect to that
mongoose.connect("mongodb+srv://admin-nihal:123@cluster0.y72li.mongodb.net/todolistDB")

// make schema of item
const itemsSchema = {
    name : String 
} ;

// make a model based on this schema
const Item = mongoose.model("Item",itemsSchema) ;

const item1 = new Item({
    name : "Welcome to your Todo List !"
}) ;

const item2 = new Item({
    name : "Hit + to add an item !"
}) ;
const item3 = new Item({
    name : "Hit - to delete and item"
}) ;

const defaultItems = [item1,item2,item3] ;

const listSchema = {
    name : String ,
    items : [itemsSchema]
} ;



const List = mongoose.model("List",listSchema) ;

app.get("/",function(req,res) {

      Item.find({},function(err,founditems) {

        if(founditems.length == 0) {
            Item.insertMany(defaultItems,function(err) {

                 if(err) console.log(err) ;
                else console.log("Succesfully Inserted default items !") ;
        });
        res.redirect("/") ;
        }
         else {
            res.render("list",{listTitle:"Today",newListitem: founditems} ) ;
         }
        
      })
   
   }) ;

   app.post("/",function(req,res) {
    let itemName = req.body.newItem ;
    let listName = req.body.list ;


    const item = new Item({
        name : itemName 
    }) ;

    if(listName == "Today") {
        item.save() ;
        res.redirect("/") ;
    }
    else {

        List.findOne({name : listName},function(err,foundList) {

            foundList.items.push(item) ;
            foundList.save() ;
            res.redirect("/" + listName) ;
        })
    }

    
   
   }) ;


  app.post("/delete",function(req,res) {
    
    const checkedItemId = req.body.checkbox ;
    const listName      = req.body.listName ;

    if(listName == "Today") {

        Item.findByIdAndRemove({_id : checkedItemId},function(err) {
            if(err) console.log("erro") ;
            else console.log("delted Succeslfully") ;
        }) ;
         res.redirect("/") ;

    }
    else {

        List.findOneAndUpdate({name : listName},{$pull : {items : { _id : checkedItemId}}},function(err,foundList) {
            if(!err) res.redirect("/"+ listName)
        })
    }
    


  })



   app.get("/:customListName",function(req,res){

     const customName = _.capitalize(req.params.customListName) ;


       List.findOne({name : customName},function(err,foundList) {

        if(!err) {
            if(!foundList) {
                const list = new List({

                    name : customName ,
                    items : defaultItems
                }) ;
            
                list.save() ;
                res.redirect("/" + customName) ;
            }
            else {
                res.render("list",{listTitle:foundList.name,newListitem: foundList.items} ) ;
            }
        }
       })
     
   
    })


    // res.render("list",{listTitle:"Work List",newListitem : workitems})


   app.post("/work",function(req,res) {
    let item = req.body.newItem ;
    workitems.push(item) ;
    res.redirect("/work") ;

   })
   
   app.get("/about",function(req,res) {
    res.render("about") ;
   })

app.listen(3000,function() {

    console.log("Server started on port 3000") ;
}) ;