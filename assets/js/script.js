var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// ADDED CODE ________________________________________________________________________________________________________________________________________________

$(".list-group").on("click", "p", function(){
  var text = $(this)
    .text()
    .trim();
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
  
});

$(".list-group").on("blur", "textarea", function(){
  //get the textareas current value and text
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group") //closest finds the first element with class listgroup, in this case the ul in index.html
    .attr("id") // adds the ID attribute from listgroup
    .replace("list-", ""); //replaces the "list-" part of the id with a blank value leaving only the category (toDo) 

  // get the task's position in the list of other li elements
  var index= $(this)
    .closest(".list-group-item")
    .index(); //saves the index (position) of the element in the list 

    tasks[status][index].text = text; //sets the text variable to equall the text content of the object at the given index in the given category
    saveTasks();

    //recreate p element
    var taskP = $("<p>")
      .addClass("m-1")
      .text(text);
    
      //replace textarea with p element
      $(this).replaceWith(taskP);

});

// when due date is clicked
$(".list-group").on("click", "span", function(){
  // get current text
  var date = $(this)
    .text()
    .trim();

  //create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

    // swap out elements

    $(this).replaceWith(dateInput);

    //enable jquery ui datepicker
    dateInput.datepicker({
      minDate: 1,
      onClose: function() { //look up onClose
        //when calendar is closed, force a "change" event on the "dateInput"
        $(this).trigger("change");
      }
    })

    //auto focus on new element
    dateInput.trigger("focus");

});

$(".list-group").on("change", "input[type='text']", function(){
  //get current text
  var date = $(this)
    .val()
    .trim();

  //get the parent ul's id
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  //get the tasks position in relation to other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update task in array and re-save to localStorage
  tasks[status][index].date = date
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

  // Pass tasks <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
    
});

$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone", // tells jQuery to create a copy of the dragged element and move the copy instead of the original
  update: function(event) {
    // array to store the task data
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function() {
      var text = $(this) //nested this refers to the child element at that index
        .find("p") //finds the p element inside "this"
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      // add taks to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
        
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
  // activate: function(event) {
  //   console.log("activate", this);
  // },
  // deactivate: function(event) {
  //   console.log("deactivate", this);
  // },
  // over: function(event) {
  //   console.log("over", event.target);
  // },
  // out: function(event) {
  //   console.log("out", event.target);
  // },
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event,ui) {
    ui.draggable.remove(); //don't need to update local storage with saveTasks(), removing a task from any list triggers a sortable update()
  },
  // over: function(event,ui) {
  //   console.log("over");
  // },
  // out: function(event,ui) {
  //   console.log("out");
  // },
});

$("#modalDueDate").datepicker({
  minDate: 1
});

var auditTask= function(taskEl) {
  //get date from task element
  var date= $(taskEl).find("span").text().trim();
  //check it worked
  // console.log(date);

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
  //should print out an object for the value of the data variable at 5:00pm of htat date
  // console.log(time);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date

  if(moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  }

  else if(Math.abs(moment().diff(time, "days")) <=2 ) { //use Math.abs to return a positive number, difference between todays date and future date is negative number(think of countdown)
    $(taskEl).addClass("list-group-item-warning");
  }
  //to ensure element is getting to the function
  // console.log(taskEl)
};

//END ADDED CODE _______________________________________________________________________________________________________________________________________



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


