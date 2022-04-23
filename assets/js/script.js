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

    //auto focus on new element
    dateInput.trigger("focus");

});

$(".list-group").on("blur", "input[type='text']", function(){
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
    
});






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


