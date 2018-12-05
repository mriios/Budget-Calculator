// Budget Controller
var budgetController =(function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
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
    percentage: -1
  };

  // Make public
  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      // Create new ID
      if(data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push it to data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids, index,

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // Calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent
      if (data.totals.inc > data.totals.exp) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else if (data.totals.inc < data.totals.exp){
        data.percentage = -1;
      }
    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },
    getPercentage: function() {
      var allPerc = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

//UI Controller
var UIController = (function() {
  // Envez de ponerlo en todos lados, llamamos el object con el method que queremos (DRY)
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.incomes__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--date'
  };


    var formatNumber = function(num, type) {
      var numSplit, int, dec, start;

      // hacer positivo
      num = Math.abs(num);
      // return new Intl.NumberFormat({style: 'currency', currency: 'USD'}).format(num);

      // Convert a number into a string with 2 decimals
      num = num.toFixed(2);

      // Split number into array. Integer([0]) and decimals([1])
      numSplit = num.split('.');

      // Check int length and add commas where necesary
      int = numSplit[0];
      if(int.length > 3){
        start = int.length % 3 === 0 ? 3 : int.length % 3;
        while(start < int.length){
          int = int.substr(0, start) + ',' + int.substr(start);
          start += 4;
        }
      }

      dec = numSplit[1];

      // Check type to add symbol, then join number
      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
      for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    };

  // Para hacer lo que returnee publico
  return {
    // Seleccionamos los valores de los inputs y los hacemos publicos
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, container;

      // Create HTML string with placeholder text
      if (type === 'inc') {
        container = DOMstrings.incomeContainer;

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        container = DOMstrings.expenseContainer;

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace placeholder text with some acutal data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      // Insert HTML into the DOM
      document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);

      el.parentNode.removeChild(el);
    },
    clearFields: function() {
      var fields, fieldsArr;

      // Seleccionar los campos (description y value), te da una lista
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      // Hacer la lista un array
      fieldsArr = Array.prototype.slice.call(fields);

      // Cambiar elementos individuales del array a nuevo valor (vacio)
      fieldsArr.forEach(function(current) {
        current.value = '';
      });

      // Ponerle focus al primer field
      fieldsArr[0].focus();
    },
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
       document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '-';
      }
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      fields.forEach(function(current, index) {
          if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
          } else {
              current.textContent = '---';
          }
      });
    },
    displayDate: function() {
      var now, date;

      now = new Date();

      date = new Intl.DateTimeFormat("en", { year: "numeric", month: "long" }).format(now);
      document.querySelector(DOMstrings.dateLabel).textContent = date;
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue
      );

      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    // Hacemos publico el objeto DOMstrings
    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl) {
  // Llamamos DOMstrings que hicimos publico en UIController
  var DOMstrings = UICtrl.getDOMstrings();

  var setupEventListeners = function() {
    // Correr funcion ctrlAddItem cuando se le pique al inputBtn
    document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);

    // Correr funcion ctrlAddItem cuando se le pique a la tecla con keycode 13 (enter)
    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
        event.preventDefault();
      }
    });

    document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function() {
    // Calculate budget
    budgetCtrl.calculateBudget();

    // Return the budget
    var budget = budgetCtrl.getBudget();

    // Display budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // Calculate percentages
    budgetCtrl.calculatePercentages();

    // Read percentages from budget controller
    var percentages = budgetCtrl.getPercentage();

    // Update UI
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // Get the field input data
    input = UICtrl.getInput();

    if (!input.description) {
        alert('Description is missing.');
        document.querySelector(DOMstrings.inputDescription).focus();
    } else if (!input.value) {
        alert('Please enter a number above 0 in the value field.');
        document.querySelector(DOMstrings.inputValue).focus();
    }

    if (input.description && input.value) {
      // Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // Add the new item to the UI
      UICtrl.addListItem(newItem, input.type);

      // Clear fields
      UICtrl.clearFields();

      // Calculate and update budget
      updateBudget();

      // Calculate and update percentages
      updatePercentages();
    }
  };

  // Delete item from data structure function
  var ctrlDeleteItem = function() {
    var itemID, splitID, type, ID;

    // Get container ID (bubble trigger)
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    // If we click an element with ID, then get ID, split and select from array
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

    // Delete item from data structure
    budgetCtrl.deleteItem(type, ID);

    // Delete item from UI
    UICtrl.deleteListItem(itemID);

    // Update and show new budget
    updateBudget();

    // Calculate and update percentages
    updatePercentages();
    }
  };

  // Public init function, set values to 0
  return {
    init: function() {
      setupEventListeners();
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, UIController);

controller.init();













































