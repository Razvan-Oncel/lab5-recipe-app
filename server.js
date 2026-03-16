const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/recipes", async (req, res) => {
  const ingredients = req.query.ingredients;
  const diet = req.query.diet || "";

  if (!ingredients || ingredients.trim() === "") {
    return res.status(400).json({
      error: "Please enter at least one ingredient."
    });
  }

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
      ingredients
    )}&number=6&ranking=1&ignorePantry=true&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({
        error: "Failed to fetch recipes from external API."
      });
    }

    const data = await response.json();

    let cleanedRecipes = data.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      usedIngredients: recipe.usedIngredients
        ? recipe.usedIngredients.map((item) => item.name)
        : [],
      missedIngredients: recipe.missedIngredients
        ? recipe.missedIngredients.map((item) => item.name)
        : [],
      recipeUrl: `https://spoonacular.com/recipes/${recipe.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")}-${recipe.id}`
    }));

    if (diet.trim() !== "") {
      cleanedRecipes = cleanedRecipes.filter(() => true);
    }

    res.json({ recipes: cleanedRecipes });
  } catch (error) {
    res.status(500).json({
      error: "Something went wrong on the server."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;