//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://admin-amara:bts123@cluster0.n0jx37u.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

//items fruitSchema

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

const item1 = new Item({
  name: "Welcome!"
});

const item2 = new Item({
  name: "Hit + sign to start adding!"
});

const item3 = new Item({
  name: "Hit this to delete!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema] // an array of itemsSchema based items (an array of items documents)
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    // check condition to do default
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved default items to database");
        }
      });
      res.redirect("/");
    } else {
      // action after default
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
    //console.log(foundItems);

  });

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  // check if it exists

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    // use res
    if (!err) {
      if (!foundList) {
        // create a mew list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

        //console.log("Doesn't exist");
      } else {
        // show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        //console.log("Exists");
      }
    }
  });





});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    // list name comes from custom list postName
    List.findOne ({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }



});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // check which list item is from
  if (listName === "Today") {

    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted item.");
        res.redirect("/");
      }
    })
    //console.log(req.body);

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }


});



// app.get("/posts/:postName", function(req, res) {
//
//       // trim white spaces, replace spaces with dashs --> kebab case
//   const requestedTitle = req.params.postName.trim().toLowerCase().split(' ').join('-');
//
//   posts.forEach(function(post) {
//     console.log(post.title);
//     let storedTitle = post.title.trim().toLowerCase().split(' ').join('-');
//
//     if (storedTitle === requestedTitle) {
//       //console.log("Match found!");
//       res.render("post", {
//         post: post
//       });
//     }
//     else {
//       console.log("Not a Match");
//     }
//   });
//
// });
// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
