function filterRecipesByDiet(recipes, diet) {
  if (!diet) return recipes;
  return recipes.filter(r => {
    if (diet === "vegetarian") return r.vegetarian !== false;
    if (diet === "gluten free") return r.glutenFree !== false;
    return true;
  });
}

if (typeof module !== "undefined") module.exports = { filterRecipesByDiet };

document.getElementById("searchBtn").onclick = async () => {

  const i = document.getElementById("ingredients").value.trim();
  const d = document.getElementById("diet").value;
  const m = document.getElementById("message");
  const r = document.getElementById("results");

  r.innerHTML = "";

  if (!i) {
    m.textContent = "Enter ingredients.";
    return;
  }

  m.textContent = "Loading...";

  try {
    const res = await fetch(`/.netlify/functions/recipes?ingredients=${encodeURIComponent(i)}&diet=${encodeURIComponent(d)}`);
    const data = await res.json();

    if (!res.ok) { m.textContent = data.error || "Something went wrong."; return; }

    const recipes = filterRecipesByDiet(data.recipes || [], data.diet || "");

    if (!recipes.length) {
      m.textContent = "No recipes found.";
      return;
    }

    m.textContent = "";

    recipes.forEach(x =>
      r.innerHTML += `
        <div class="card">
          <img src="${x.image}" alt="${x.title}">
          <h2>${x.title}</h2>
          <p>Used: ${x.usedIngredients.join(", ")}</p>
          <p>Missing: ${x.missedIngredients.join(", ")}</p>
          <a href="${x.recipeUrl}" target="_blank">Recipe</a>
        </div>`
    );

  } catch {
    m.textContent = "Error fetching recipes.";
  }

};
