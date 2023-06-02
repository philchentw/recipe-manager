const recipeInput = document.querySelector(".recipe-input input");
const recipeBox = document.querySelector(".recipe-box");
// const APIKey = "c1aeb73bdc6b46b1a099acfc9ecaba78"; // ncufood
// const APIKey = 'ffd949fd26bb48cb81fd04bec35c3e43'; // jia 1
// const APIKey = '72790c6a97ae465385b0d0ae0a5aa48a'; // jia 2
const APIKey = '01f045ce89984e94b2947c5adab48ce5';
const clearBtn = document.getElementById("clearBtn");

// 獲取模態窗口元素
const modal = document.getElementById("myModal");
const titleInModal = modal.querySelector(".modal-content h2");
const imgInModal = modal.querySelector(".modal-content img");
const ingredientsInModal = modal.querySelector(".modal-content ul");
const stepNumInModal = document.querySelector(".step-heading");
const instructionsInModal = modal.querySelector(".modal-content div ol");

// 獲取關閉按鈕元素，並為其添加點擊事件監聽器
const span = document.getElementsByClassName("close")[0];
span.onclick = function () {
  // 當關閉按鈕被點擊時，隱藏模態窗口
  modal.style.display = "none";
};

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const savedButton = document.getElementById("Saved");

let currentStepIndex = 0;
let currentInstruction;
// recipe storage
let recipeNumber;
let recipesID;
let recipesIngredient;
let recipesImageURL;
let recipesTitle;
let recipesInstructions;

// Saved recipe
let savedRecipeTitles = [];
let savedRecipeImages = [];

function recipesInit() {
  recipeNumber = 0;
  recipesID = [];
  recipesImageURL = [];
  recipesTitle = [];
  recipesIngredient = null;
  recipesInstructions = null;
}

function savedRecipeInit() {
  savedRecipeTitles = [];
  savedRecipeImages = [];
}

function findIndexOfRecipe(title) {
  for (let i = 0; i < recipesTitle.length; i++) {
    if (recipesTitle[i] === title) {
      // console.log(recipesTitle[i] + ' ' + title);
      return i;
    }
  }
  return -1;
}

function setEventForRecipe(recipe) {
  const title = recipe.querySelector(".recipe-title");
  
  title.addEventListener("click", function () {
    // console.log(recipe);

    // set title in modal
    titleInModal.textContent = title.textContent;
    // set image in modal
    imgInModal.src = recipe.querySelector(".recipe-image").src;
    // set ingredients in modal
    ingredientsInModal.innerHTML = "";
    let index = findIndexOfRecipe(title.textContent);
    let ingredients = recipesIngredient[index];
    for (let i = 0; i < ingredients.length; i++) {
      let ingredient = document.createElement("li");
      ingredient.innerHTML = `${ingredients[i].name} ${ingredients[i].amount.us.value} ${ingredients[i].amount.us.unit}`;
      ingredientsInModal.appendChild(ingredient);
    }
    
    // set instructions in modal
    // console.log(recipesInstructions[index]);
    
    currentStepIndex = 0;
    currentInstruction = recipesInstructions[index];
    stepNumInModal.textContent = "Step" + " " + (currentStepIndex + 1);
    instructionsInModal.innerHTML = currentInstruction[currentStepIndex];

    modal.style.display = "block";

  });
}

// set prevButton and nextButton eventListener
prevButton.addEventListener("click", function () {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    stepNumInModal.textContent = "Step" + " " + (currentStepIndex + 1);
    instructionsInModal.innerHTML = currentInstruction[currentStepIndex];
    // console.log(currentStepIndex);
  }
});

nextButton.addEventListener("click", function () {
  if (currentStepIndex < currentInstruction.length - 1) {
    currentStepIndex++;
    stepNumInModal.textContent = "Step" + " " + (currentStepIndex + 1);
    instructionsInModal.innerHTML = currentInstruction[currentStepIndex];
    // console.log(currentStepIndex);
  }
});

function setEventForSavedButton(recipe) {
  const plusIcon = recipe.querySelector(".uil-plus");
  
  plusIcon.addEventListener("click", function () {
    // 在這裡寫入你想要執行的程式碼或觸發的事件
    console.log("You clicked the plus icon!");
    // 執行其他操作...
    savedRecipeTitles.push(recipe.querySelector(".recipe-title").textContent);
    savedRecipeImages.push(recipe.querySelector(".recipe-image").src);
    console.log(savedRecipeTitles);
    console.log(savedRecipeImages);
  });
}

function addRecipeHTML(title, imageUrl) {
  const listItem = document.createElement("li");
  recipeNumber += 1;
  listItem.id = "recipe" + recipeNumber;
  listItem.classList.add("recipe-item");
  listItem.innerHTML = `<p class="recipe-title" >${title}</p>
      <img class="recipe-image" src="${imageUrl}" alt="Recipe Image">
      <i class="uil uil-plus saved-icon"></i>`;

  setEventForRecipe(listItem);
  setEventForSavedButton(listItem);

  recipeBox.appendChild(listItem);
  // 在每個 <li> 元素後插入 <hr> <br>元素
  const horizontalLine0 = document.createElement("br");
  const horizontalLine1 = document.createElement("hr");
  const horizontalLine2 = document.createElement("br");
  recipeBox.appendChild(horizontalLine0);
  recipeBox.appendChild(horizontalLine1);
  recipeBox.appendChild(horizontalLine2);
  recipeBox.scrollTop = recipeBox.scrollHeight;
}

async function fetchRecipeIngredients() {
  const ingredientPromises = recipesID.map((rID) => {
    return fetch(
      `https://api.spoonacular.com/recipes/${rID}/ingredientWidget.json?apiKey=${APIKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Process and store ingredient data
        const ingredients = data.ingredients;
        return ingredients;
      });
  });

  const ingredientDataArray = await Promise.all(ingredientPromises);
  // console.log(ingredientDataArray);
  recipesIngredient = ingredientDataArray;
  // Store ingredient data in separate one-dimensional array if needed
}

async function fetchRecipeInstructions() {
  const instructionPromises = recipesID.map((rID) => {
    return fetch(
      `https://api.spoonacular.com/recipes/${rID}/analyzedInstructions?apiKey=${APIKey}`
    )
      .then((response) => response.json())
      .then((data) => {
        // Process and store instruction data
        const instructions = data[0].steps.map((step) => step.step);
        return instructions;
      });
  });

  const instructionDataArray = await Promise.all(instructionPromises);
  // console.log(instructionDataArray);
  recipesInstructions = instructionDataArray;
  // Store instruction data in separate one-dimensional array if needed
}


recipeInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    recipesInit();
    recipeBox.innerHTML = "";
    const taskText = recipeInput.value;
    if (taskText === "") {
      return;
    }

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${taskText}&apiKey=${APIKey}`
      );
      const data = await response.json();

      data.results.forEach((recipe) => {
        
        recipesID.push(recipe.id);
        recipesTitle.push(recipe.title);
        recipesImageURL.push(recipe.image);
      });

      // console.log(recipesID);
      // console.log(recipesTitle);
      // console.log(recipesImageURL);

      // Call other functions here
      await fetchRecipeIngredients();
      await fetchRecipeInstructions();

      for (let i = 0; i < recipesTitle.length; i++) {
        addRecipeHTML(recipesTitle[i], recipesImageURL[i]);
      }
    } catch (error) {
      console.log(error);
    }

    recipeInput.value = "";
  }
});


recipeBox.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("uil-trash-alt")) {
    const listItem = target.parentElement;
    listItem.remove();
  }
});

clearBtn.addEventListener("click", () => {
  recipeBox.innerHTML = "";
});

savedButton.addEventListener("click", function () {
  // 清空 recipe-box 的內容
  recipeBox.innerHTML = "";

  // 根據儲存的食譜清單重新生成內容
  for (let i = 0; i < savedRecipeTitles.length; i++) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<p class="recipe-title" >${savedRecipeTitles[i]}</p>
      <img class="recipe-image" src="${savedRecipeImages[i]}" alt="Recipe Image">
      <i class="uil uil-trash"></i>`;
    setEventForRecipe(listItem);
    recipeBox.appendChild(listItem);
    recipeBox.appendChild(document.createElement("br"));
    recipeBox.appendChild(document.createElement("hr"));
    recipeBox.appendChild(document.createElement("br"));
    recipeBox.scrollTop = recipeBox.scrollHeight;
  }
});