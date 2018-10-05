/* The application Macrosso is used to track macronutrients of a user by days. The user can see how many macros he/she consumed each day with total calories. The user can also modify, delete food items individually and collectively. Right now, I am working on incorporation the day filter.

Vision for time implementation:
    - When the user initially enters, he can only see "Add area".
    - After the user adds an item, the Select option will be available with item's date, the item list for that date and the total macros.
    - By default, when the user enters the website with many items at many dates, the latest available date will appear.
    - If the user adds an item, that item's day will appear.
    - The latest 7 days are only available in the Add item, but the history will store and show all the previously added items.

Plan for incorporating time:
    - Each item has a property "day". When we create an item, item's timestamp will be added to "day".
    - days array is needed in order to store different available days
    - each day will have another array of items
    - CurrentDay array is needed in order to store items of the day
    - When a user adds an item, item's day value will be used to evaluate in which day array the item will be placed
    - CurrentDay will be used to show the current day

Challenges:
    - Figure out how to dynamically populate the select day with new dates
    - Compare all available dates and determine the latest one to display

    LATEST STATUS

    A few problems:
    - When adding an item it displays on the current day
    - When clicking state buttons, the day select changes I don't know why
    - Total macros not fixed
    - When adding an item, the item's day doesn't open
*/





//   Item Controller
const ItemCtrl = (function() {
    //  Item object
    const Item = function(id, name, carbs, proteins, fats, day) {
        this.id = id;
        this.name = name;
        this.carbs = carbs;
        this.proteins = proteins;
        this.fats = fats;
        this.day = day;
    }
    //  Data Structure / State
    const state = {
        items: [],
        currentItem: null,
        totalCalories: 0,
        totalCarbs: 0,
        totalProteins: 0,
        totalFats: 0
    }

    return {

        logState: function() {
            return state;
        },
        getItems: function() {
            return state.items;
        },
        //  Add Item to data structure
        addItem: function(name, carbs, proteins, fats, day) {
            let id;
            //Create ID
            if (state.items.length > 0) {
                // Take the id of the last item and increment by 1
                id = state.items[state.items.length - 1].id + 1;
            } else {
                id = 0;
            }

            //  Convert the day from normal to timestamp
            day = new Date(day).getTime();

            //  Create a new item with parameters passed from ADD Click Event
            const item = new Item(id, name, parseInt(carbs), parseInt(proteins), parseInt(fats), day);

            //  Add new item into Data Structure
            state.items.push(item);

            return item;
        },
        
        //  Function returns total macros by looping through data structure
        getTotalMacros: function(day) {
            let _totalCalories = 0;
            let _totalCarbs = 0;
            let _totalFats = 0;
            let _totalProteins = 0;
            let _dayItems = [];

            //  Format the day
            const dayName = UICtrl.formatDay(day);

            _dayItems = state.items.filter(item => item.day === day);

            _dayItems.forEach(function(item) {
                _totalCarbs += item.carbs;
                _totalFats += item.fats;
                _totalProteins += item.proteins;
            });
            _totalCalories = _totalCarbs * 4 + _totalProteins * 4 + _totalFats * 9;

            state.totalCalories = _totalCalories;
            state.totalCarbs = _totalCarbs;
            state.totalProteins = _totalProteins;
            state.totalFats = _totalFats;

            return {
                calories : state.totalCalories,
                carbs : state.totalCarbs,
                proteins : state.totalProteins,
                fats : state.totalFats,
                dayName : dayName
            }
        },
        setCurrentItem: function(item) {
            state.currentItem = item;
        },
        getCurrentItem: function() {
            return state.currentItem;
        },
        updateItems: function() {
            //  Get the currect item
            let updatedItem = state.currentItem;
            //  Update the DS based on id
            state.items.forEach(function(item) {
                if (item.id === updatedItem.id) {
                    item = updatedItem;
                }
            });
        },
        deleteCurrentItem: function() {
            state.items.forEach(function(item, index) {
                if (item === state.currentItem) {
                    state.items.splice(index, 1);
                    state.currentItem = null;
                }
            });
        },
        deleteAllData: function() {
            state.items = [];
        },
        setItems: function(items) {
            state.items = items;
        }
    }
})();

//  Days Controller
const DayCtrl = (function() {
    
//  Days Data Structure
const state = {
    days: [],
    currentDay: null
    };


    //  Public Variables
    return {
        logData: function() {
            return state.days;
        },
        //  The function returns timestampts of the last 7 days
        getLast7Days: function() {
            const oneDay = 8.64e7; // milliseconds in one day
            const today = new Date();
            const day0 = today.getTime();
            const day1 = day0 - oneDay;
            const day2 = day0 - 2*oneDay;
            const day3 = day0 - 3*oneDay;
            const day4 = day0 - 4*oneDay;
            const day5 = day0 - 5*oneDay;
            const day6 = day0 - 6*oneDay;

            return [day0, day1, day2, day3, day4, day5, day6];
        },
        setDays: function(items) {
            //  Function returns true only for objects with unique dates
            function uniqueDays(a) {
                if (!this[a.day]) {
                    this[a.day] = true;
                    return true;
                }
            }

            //  Filter array of it
            const uniqueItems = items.filter(uniqueDays, Object.create(null));

            //  Now collect unique day stampts
            let days = [];
            uniqueItems.forEach(function(item) {
                days.push(item.day);
            })
            days.sort(function(a, b){return b - a});
            state.days = days;
        },
        getDays: function() {
            return state.days;
        },
        setCurrentDay: function(day) {
            state.currentDay = day;
        },
        getCurrentDay: function() {
            return state.currentDay;
        },
        getLatestDay: function() {
            return state.days[0];
        }
    }
})();

//   UI Controller
const UICtrl = (function() {
    //  Select the DOM elements only once here
    const _UISelectors = {
        itemList: '#item-list',
        addBtn: '.add-btn',
        updateBtn: '.update-btn',
        deleteBtn: '.delete-btn',
        backBtn: '.back-btn',
        editBtn: '.edit-btn',
        clearAllBtn: '#clear-all',
        day: '#day', // first select
        meal: '#meal',
        carbs: '#carbs',
        proteins: '#proteins',
        fats: '#fats',
        totalCalories: '.total-calories',
        totalCarbs: '.total-carbs',
        totalProteins: '.total-proteins',
        totalFats: '.total-fats',
        macros: "#macros",
        daySelect: "#macros-day-title", //second select
        dayName: ".total-day",
    };


    //  Public methods
    return {
        showItems: function(items) {
            const itemList = document.querySelector(_UISelectors.itemList);
            let output = '';

            //  Populate List with items
            items.forEach(function(item) {
                output += `
                <li class="collection-item" id="item-${item.id}">
                    <strong>${item.name}: </strong><em>Carbs ${item.carbs}g + Proteins ${item.proteins}g + Fats ${item.fats}g = ${item.proteins*4 + item.carbs*4 + item.fats*9} Calories</em>
                    <a href="#" class="edit-btn secondary-content"><i class="material-icons">edit</i></a>
                </li>`;
            });
            itemList.innerHTML = output;
        },
        getSelectors: function() {
            return _UISelectors;
        },
        getInputData: function() {
            //  Get the input day from select
            const select = document.querySelector(_UISelectors.day);
            const day = select.options[select.selectedIndex].text;


            const name = document.querySelector(_UISelectors.meal).value;
            const carbs = document.querySelector(_UISelectors.carbs).value;
            const proteins = document.querySelector(_UISelectors.proteins).value;
            const fats = document.querySelector(_UISelectors.fats).value;
    
            return {name, carbs, proteins, fats, day};
        },
        //  Display a newly added item in the UI
        showNewItem: function(newItem) {

            let itemList = document.querySelector(_UISelectors.itemList);

            const li = document.createElement('li');
            li.className = 'collection-item';
            li.id = `item-${newItem.id}`;
            li.innerHTML = `
                <strong>${newItem.name}: </strong><em>Carbs ${newItem.carbs}g + Proteins ${newItem.proteins}g + Fats ${newItem.fats}g = ${newItem.proteins*4 + newItem.carbs*4 + newItem.fats*9} Calories</em>
                <a href="#" class="edit-btn secondary-content"><i class="material-icons">edit</i></a>`;
            itemList.appendChild(li);
        },
        clearInput: function() {
            document.querySelector(_UISelectors.meal).value = '';
            document.querySelector(_UISelectors.carbs).value = '';
            document.querySelector(_UISelectors.proteins).value = '';
            document.querySelector(_UISelectors.fats).value = '';
            // document.querySelector(_UISelectors.day).value = '0'; // To confirm
        },
        displayMacros: function(macros) {
            document.querySelector(_UISelectors.totalCalories).textContent = macros.calories;
            document.querySelector(_UISelectors.totalCarbs).textContent = macros.carbs;
            document.querySelector(_UISelectors.totalProteins).textContent = macros.proteins;
            document.querySelector(_UISelectors.totalFats).textContent = macros.fats;
            document.querySelector(_UISelectors.dayName).textContent = macros.dayName;

        },
        clearEditState: function() {
            UICtrl.clearInput();
            //  Hide Edit Buttons and show Add Button
            document.querySelector(_UISelectors.addBtn).style.display = 'inline';
            document.querySelector(_UISelectors.updateBtn).style.display = 'none';
            document.querySelector(_UISelectors.deleteBtn).style.display = 'none';
            document.querySelector(_UISelectors.backBtn).style.display = 'none';

            //  User can't change the date of the item because it may be out of 7-day range
            document.querySelector(_UISelectors.day).selectedIndex = '0';
            document.querySelector(_UISelectors.day).disabled = false;
            //  Populate ADD select because in the showEditState it's being changed
            const days = DayCtrl.getLast7Days();
            UICtrl.populateAddSelect(days);
            
            const currentDay = UICtrl.getDay();
            //  Get total macros from Data Structure
            const totalMacros = ItemCtrl.getTotalMacros(currentDay);
            
            //  Display macros in the UI
            UICtrl.displayMacros(totalMacros);
            
            //  Materialize: Update input fields
            M.updateTextFields();

        },
        formatDay: function(timestamp) {
            const day = new Date(timestamp);

            //  Make a good formatting
            dayOfMonth = day.getDate();
            month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][day.getMonth()];
            year = day.getFullYear();

            return dayOfMonth + ' ' + month + ' ' + year;
            
        },
        showEditState: function() {
            //  Fetch current item
            const item = ItemCtrl.getCurrentItem();
            // console.log(item);
            //  Show input values of editted item
            document.querySelector(_UISelectors.meal).value = item.name;
            document.querySelector(_UISelectors.carbs).value = item.carbs;
            document.querySelector(_UISelectors.proteins).value = item.proteins;
            document.querySelector(_UISelectors.fats).value = item.fats;


            //  Convert the day in a readable format
            const day = UICtrl.formatDay(item.day);

            //  Insert the item's date in the select
            const select = document.querySelector(_UISelectors.day);
            select.innerHTML = `<option value="this-day">${day}</option>`;
            
            //  Show the item's date in disabled select
            select.value = 'this-day';
            select.disabled = 'true';
            

            //  Materialize: Update input fields
            M.updateTextFields();

            //  Hide Add button and show Edit buttons
            document.querySelector(_UISelectors.addBtn).style.display = 'none';
            document.querySelector(_UISelectors.updateBtn).style.display = 'inline';
            document.querySelector(_UISelectors.deleteBtn).style.display = 'inline';
            document.querySelector(_UISelectors.backBtn).style.display = 'inline';
            
        },
        //  Function to hide the macros panel
        hideMacros: function() {
            document.querySelector(_UISelectors.macros).style.display = 'none';
        },
        showMacros: function() {
            document.querySelector(_UISelectors.macros).style.display = 'block';
        },
        //  Function receives an array of last 7 days in timestamp and populates the select dates menu
        populateAddSelect: function(days) {
            //  Select parent
            const select = document.querySelector(_UISelectors.day);
            let option, dayOfMonth, month, year;
            let = options = '';

            //  Loop through each input
            days.forEach(function(dayTimestamp, index) {
                //  Convert from timestamps to UI dates
                day = new Date(dayTimestamp);

                //  Make a good formatting
                dayOfMonth = day.getDate();
                month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][day.getMonth()];
                year = day.getFullYear();

                //  Create HTML elements
                option = document.createElement('option');
                option.setAttribute('value', `day${index}`);
                option.innerHTML = dayOfMonth+' '+ month +' '+ year;

                //  Stack options on each other
                options += option.outerHTML;
            });
            select.innerHTML = options;
        },
        populateDaySelect: function(days) {
            //  Select parent
            const select = document.querySelector(_UISelectors.daySelect);
            let option, dayOfMonth, month, year;
            let options = '';

            //  Loop through each input
            days.forEach(function(dayTimestamp, index) {
                //  Convert from timestamps to UI dates
                day = new Date(dayTimestamp);

                //  Make a good formatting
                dayOfMonth = day.getDate();
                month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][day.getMonth()];
                year = day.getFullYear();

                //  Create HTML elements
                option = document.createElement('option');
                option.setAttribute('value', `day${index}`);
                option.innerHTML = dayOfMonth+' '+ month +' '+ year;

                options += option.outerHTML;
            });
            //  Insert inside select
            select.innerHTML = options;

            //  Change the select input option to that day as well
            UICtrl.changeSelectInput();
        },
        //  Function changes the day in UI
        changeDay: function() {
            const currentDay = DayCtrl.getCurrentDay();
            let itemsOnThatDay = [];

            const items = ItemCtrl.getItems();
            items.forEach(function(item) {
                if (item.day === currentDay) {
                    itemsOnThatDay.push(item);
                }
            });
            UICtrl.showItems(itemsOnThatDay);

            

            //  Do not display the panel if there are no items in total
            if (items.length === 0) {
                UICtrl.hideMacros();
            } else {
                UICtrl.showMacros();
            }
        },
        //  Function looks up the current day on the select and returns it's timestamp
        getDay: function() {

            const selector = document.querySelector(_UISelectors.daySelect);
            let day = selector.options[selector.selectedIndex].text;
            
            //  Convert into timestamp
            day = new Date(day);

            const timestampDay = day.getTime();

            return timestampDay;
        },
        changeSelectInput: function() {
            const currentDay = DayCtrl.getCurrentDay();
            const days = DayCtrl.getDays();
            const index = days.indexOf(currentDay);


            document.querySelector(_UISelectors.daySelect).selectedIndex = index;
        }
    }
})();
//   Storage Controller
const StorageCtrl = (function() {
    //  Private 


    //  Public
    return {
        getItems: function() {
            let items;

            if (localStorage.getItem('macrossoItems') === null) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('macrossoItems'));
            }

            return items;
        },
        syncItems: function(items) {
            //  Simply synchronize the local storage every time data structure changes
            localStorage.setItem('macrossoItems', JSON.stringify(items));
        }

    }
})();
//   App Controller
const AppCtrl = (function(ItemCtrl, StorageCtrl, UICtrl) {
    //  Load event listeners
    const loadEventListeners = function() {
        const UISelectors = UICtrl.getSelectors();

        //  Listen to Add Meal button
        document.querySelector(UISelectors.addBtn).addEventListener('click', addInputItem);
        
        //  Listen to Edit button
        document.querySelector(UISelectors.itemList).addEventListener('click', editItem);

        //  Listen to Update button
        document.querySelector(UISelectors.updateBtn).addEventListener('click', updateItem);

        //  Disable Enter button (to prevent addition in Update state)
        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                return false;
            }
        });
        
        //  Listen to Delete button
        document.querySelector(UISelectors.deleteBtn).addEventListener('click', deleteItem);
        
        //  Listen to Back button
        document.querySelector(UISelectors.backBtn).addEventListener('click', goBack);
        
        //  Listen to Clear All button
        document.querySelector(UISelectors.clearAllBtn).addEventListener('click', clearAllItems);

        //  Listen to select change in Macros Panel
        document.querySelector(UISelectors.daySelect).addEventListener('change', changeCurrentDay);
    }

    //  Function listens to Add button and performs actions
    const addInputItem = function(e) {
        const input = UICtrl.getInputData();

        // Ensure the input is not empty
        if (input.name !== '' && input.carbs !== '' && input.proteins !== '' && input.fats !== '') {
            //  Add an item to Data Structure
            const addedItem = ItemCtrl.addItem(input.name, input.carbs, input.proteins, input.fats, input.day);

            //  retrieve the items to further put in LS
            let items = ItemCtrl.getItems();
            //  Filter items and set an array of unique days
            DayCtrl.setDays(items);

            //  Change the selected day to the day of input (But first convert to timestamp)
            const day = new Date(input.day).getTime();
            DayCtrl.setCurrentDay(day);

            //  Show only the day on which the item added
            UICtrl.changeDay();
            
            
            //  Populate day select options of the Macros panel
            UICtrl.populateDaySelect(DayCtrl.getDays());


            //  Synchronize local storage now
            StorageCtrl.syncItems(items);

            //  Get total macros from Data Structure
            const totalMacros = ItemCtrl.getTotalMacros(day);
            
            //  Display macros in the UI
            UICtrl.displayMacros(totalMacros);

            //  Clear input fields
            UICtrl.clearInput();
        }

        e.preventDefault();
    }

    //  Function uses event delegation and shows the Edit state
    const editItem = function(e) {

        //  Check if the edit button is clicked
        if (e.target.parentElement.classList.contains('edit-btn')) {

            let itemID = e.target.parentElement.parentElement.id;
            
            let correctItem;

            const items = ItemCtrl.getItems();

            items.forEach(function(item) {
                if (itemID === `item-${item.id}`) {
                    correctItem = item; 
                }
            });
            
            //  Set current item
            ItemCtrl.setCurrentItem(correctItem);

            //  Display Item to Edit
            UICtrl.showEditState();
        }

        e.preventDefault();
    }

    const updateItem = function(e) {
        let currentItem = ItemCtrl.getCurrentItem();

        const inputItem = UICtrl.getInputData();

        currentItem.name = inputItem.name;
        currentItem.carbs = parseInt(inputItem.carbs);
        currentItem.proteins = parseInt(inputItem.proteins);
        currentItem.fats = parseInt(inputItem.fats);
        
        //  Update the current item object
        ItemCtrl.setCurrentItem(currentItem);

        //  Update the data structure
        ItemCtrl.updateItems();

        const items = ItemCtrl.getItems();

        //  Filter items and set an array of unique days
        DayCtrl.setDays(items);
            
        //  Populate day select options of the Macros panel
        UICtrl.populateDaySelect(DayCtrl.getDays());

        //  Synchronize local storage now
        StorageCtrl.syncItems(items);

        //  Change the selected day to the day of input (But first convert to timestamp)
        const day = UICtrl.getDay();
        DayCtrl.setCurrentDay(day);

        //  Show only the day on which the item added
        UICtrl.changeDay();

        //  Exit edit mode
        UICtrl.clearEditState();

        e.preventDefault();
    }

    const deleteItem = function(e) {
        //  Delete item from Data structure
        ItemCtrl.deleteCurrentItem();

        //  Synchronize local storage now
        StorageCtrl.syncItems(ItemCtrl.getItems());
        
        //  Change the selected day to the day of input (But first convert to timestamp)
        const day = UICtrl.getDay();
        DayCtrl.setCurrentDay(day);

        //  Show only the day on which the item added
        UICtrl.changeDay();

        //  Exit edit mode
        UICtrl.clearEditState();

        e.preventDefault();
    }

    const goBack = function(e) {

        UICtrl.clearEditState();

        e.preventDefault();
    }

    const clearAllItems = function(e) {
        //  delete all items in data structure
        ItemCtrl.deleteAllData();

        //  Synchronize local storage now
        StorageCtrl.syncItems(ItemCtrl.getItems());


        //  Get total macros from Data Structure
        const totalMacros = ItemCtrl.getTotalMacros(null); // make total macros zero by providing null day
        
        //  Display macros in the UI
        UICtrl.displayMacros(totalMacros);

        
        //  Display updated items in the UI
        const items = ItemCtrl.getItems()
        UICtrl.showItems(items);

        //  Do not display the panel if there are no items in total
        if (items.length === 0) {
            UICtrl.hideMacros();
        } else {
            UICtrl.showMacros();
        }
    }

    const changeCurrentDay = function(e) {
        //  Get the selected day's timestamp
        const selected = UICtrl.getDay();

        //  Set the current day to selected day
        DayCtrl.setCurrentDay(selected);

        //  Update the total macros according to current day
        const totalMacros = ItemCtrl.getTotalMacros(selected);

        UICtrl.displayMacros(totalMacros);

        //  Show current day in the UI
        UICtrl.changeDay();
        

        e.preventDefault();
    }
    
    //  Public methods
    return {
        init: function() {
            //  Load all event listeners
            loadEventListeners();

            //  Populate Select options
            const days = DayCtrl.getLast7Days();
            UICtrl.populateAddSelect(days);

            //  Get items from local storage
            let items = StorageCtrl.getItems();

            //  Filter items and set an array of unique days
            DayCtrl.setDays(items);


            //  Set items in data structure
            ItemCtrl.setItems(items);

            //  Get total macros from Data Structure
            const totalMacros = ItemCtrl.getTotalMacros(DayCtrl.getLatestDay());
                
            //  Display macros in the UI
            UICtrl.displayMacros(totalMacros);

            //set current day to the latest day
            DayCtrl.setCurrentDay(DayCtrl.getLatestDay());

            //  Display food items on the current day
            UICtrl.changeDay();

            //  Populate day select options of the Macros panel
            UICtrl.populateDaySelect(DayCtrl.getDays());

            //  Clear Edit State
            UICtrl.clearEditState();
        }
    }

})(ItemCtrl, StorageCtrl, UICtrl);

M.AutoInit();

$(document).ready(function(){
    $('select').formSelect();
  });

AppCtrl.init();

