// BUDGET CONTROLLER
var budgetController = (function() {
	var Expenses = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function(id, description, value){
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur){
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: 0
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			// Create new id
			if(data.allItems[type] > 0){
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			
			// Create new item based on 'inc' or 'exp' type
			if(type === 'exp') {
				newItem = new Expenses(ID, des, val);
			} else if(type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// push it into our data structure
			data.allItems[type].push(newItem);

			// return the new element
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if(index !== -1) {
				data.allItems[type].splice(index, 1);
			}

		},

		calculateBudget: function() {
			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate percentage
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = 0;
			}
			
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		}

	}


})();


// UI CONTROLLER
var UIController = (function() {
	var DOMstrings = {
		inputType: ".add__type",
		inputDscr: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expensesLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		dataLabel: ".budget__title--month"
	};

	var formatNumber = function(num, type) {
		var numSplit, int, dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if(int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3) // 23456 => 23,456
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //'exp' or 'inc'
				descr: document.querySelector(DOMstrings.inputDscr).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},


		addListItem: function(obj, type) {
			var html, newHtml, element;

			// Create HTML string with placeholder text
			if(type === 'inc') {
				element = DOMstrings.incomeContainer;

				html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type === 'exp') {
				element = DOMstrings.expensesContainer;

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},

		clearFields: function(){
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDscr + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, value){
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayMonth: function() {
			var now, months, month, year;

			now = new Date();

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year;

		},

		changeType: function() {
			var fields = document.querySelectorAll(
					DOMstrings.inputType + ',' +
					DOMstrings.inputDscr + ',' +
					DOMstrings.inputValue
				);

			for(var i = 0; i < fields.length; i++){
				fields[i].classList.toggle('red-focus');
			}

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings: function(){
			return DOMstrings;
		}
	};
})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

		document.addEventListener("keypress", function(event) {
			if(event.keyCode === 13 || event.which === 13){
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType);
	};

	var updateBudget = function() {
		// Calculate the budget
		budgetCtrl.calculateBudget();

		// Return the budget
		var budget = budgetCtrl.getBudget();

		// Display the budgen on the UI
		UICtrl.displayBudget(budget);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the field input data
		input = UICtrl.getInput();

		if(input.descr !== "" && !isNaN(input.value) && input.value > 0){
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.descr, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();
		}

	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type,ID;
		
		itemID = event.target.parentNode.parentNode.parentNode.id;

		if(itemID) {
			splitID = itemID.split("-");
			type = splitID[0];
			ID = parseInt(splitID[1]);
		}

		// delete the item from the data structure
		budgetCtrl.deleteItem(type, ID);

		// delete the item from the UI
		UICtrl.deleteListItem(itemID);

		// update and show the new budget
		updateBudget();

		//Calculate and update percentages
		updatePercentage();
	};

	return {
		init: function() {
			setupEventListeners();
			UICtrl.displayMonth();
			UICtrl.displayBudget({ 
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
		}
	}

})(budgetController, UIController);

controller.init();