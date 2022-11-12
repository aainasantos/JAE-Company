const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/records', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://admin-aina:Godisgood26@cluster0.8ctzk.mongodb.net/tileDB');


const incomeSchema = {
    date: String,
    way: String,
    amount: Number
}

const Income = mongoose.model("Income", incomeSchema);

const expenseSchema = {
    date: String,
    what: String,
    amount: Number
}

const Expense = mongoose.model("Expense", expenseSchema)

const Tile = mongoose.model('Tile', {
    date: String,
    expense : expenseSchema,
    income : incomeSchema
});

var day = new Date().getDate();
var month = new Date().getMonth() + 1;
var year = new Date().getFullYear();

day < 10 ? day="0"+day : day;

let todayDate = year+'-'+month+'-'+day

app.get('/', function(req, res){
    Tile.find({}, function(err, tile){
        res.render('main', {
            tiles: tile,
            date: todayDate
        });
    })    
})

app.post('/', function(req, res){
    var add = req.body.add;
    if(add === "income"){
        res.redirect('/income')
    }else if(add === 'expenses'){
        res.redirect('expenses')
    }else{
        res.redirect('/');
    }
});

app.get('/income', function(req, res){
   Income.find({}, function(err, incomes){
    if(!err){
        res.render('income', {
            incomes: incomes,
            date: todayDate
        })
    }        
    })
})

app.post('/income', function(req, res){
    let newIncome = req.body;
    const income = new Income({
        date: newIncome.date,
        way: newIncome.way,
        amount: newIncome.amount
    });
    income.save().then(item => {
        console.log("DB Item saved --->", item);
        res.status(200)
    }).catch(err => {
        res.status(400).send("unable to save to database");
    });
    res.redirect('/income');
    const tile = new Tile ({
        date: newIncome.date,
        income: income
    })
    tile.save();
});

app.get('/expenses', function(req, res){
    Expense.find({}, function(err, expenses){
        if(!err){
            res.render('expenses', {
                expenses: expenses,
                date: todayDate
            })
        }        
        })
})

app.post('/expenses', function(req, res){
    let newExpense = req.body;
    const expense = new Expense({
        date: newExpense.date,
        what: newExpense.what,
        amount: newExpense.amount
    });
    expense.save().then(item => {
        console.log("DB Item saved --->", item);
        res.status(200)
    }).catch(err => {
        res.status(400).send("unable to save to database");
    });
    res.redirect('/expenses');
    const tile = new Tile ({
        date: newExpense.date,
        expense: expense
    })
    tile.save();
});

app.get('/records/income', function(req, res){
    Income.find({}, function(err, incomes){
        res.render('iRecord', {
            date: todayDate,
            incomes: incomes
        })
    })
});

app.get('/records/expenses', function(req, res){
    Expense.find({}, function(err, expenses){
        res.render('eRecord', {
            date: todayDate,
            expenses: expenses
        })
    })  
});

app.post('/idelete', function(req, res){
    let del = req.body.del;
    Income.findOneAndDelete(del, function(err){
        if(err){
            alert("nothing to delete");
        }
    });
    Tile.findOneAndDelete(del, function(err){
        if(err){
            alert("nothing to delete");
        }
    });
    res.redirect('/income');
});

app.post('/edelete', function(req, res){
    let del = req.body.del;
    Expense.findOneAndDelete(del, function(err){
        if(err){
            alert("nothing to delete");
        }
    });
    Tile.findOneAndDelete(del, function(err){
        if(err){
            alert("nothing to delete");
        }
    });
    res.redirect('/expenses');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, function(){
    console.log('Server is running!');
});