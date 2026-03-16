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
    const res = await fetch(`/api/recipes?ingredients=${encodeURIComponent(i)}&diet=${d}`);
    const data = await res.json();

    if (!data.recipes?.length) {
      m.textContent = "No recipes found.";
      return;
    }

    m.textContent = "";

    data.recipes.forEach(x =>
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