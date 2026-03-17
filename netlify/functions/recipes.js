exports.handler = async (event) => {
  const { ingredients, diet = "" } = event.queryStringParameters || {};

  if (!ingredients || !ingredients.trim()) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please enter at least one ingredient." })
    };
  }

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;

    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=6&ranking=1&ignorePantry=true&apiKey=${apiKey}`
    );

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch recipes." })
      };
    }

    const data = await response.json();

    let dietMap = {};
    if (diet && data.length > 0) {
      const ids = data.map(r => r.id).join(",");
      const bulk = await fetch(`https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&apiKey=${apiKey}`);
      if (bulk.ok) {
        const bulkData = await bulk.json();
        bulkData.forEach(r => { dietMap[r.id] = { vegetarian: r.vegetarian, glutenFree: r.glutenFree }; });
      }
    }

    let recipes = data.map(r => ({
      id: r.id,
      title: r.title,
      image: r.image,
      usedIngredients: r.usedIngredients?.map(i => i.name) || [],
      missedIngredients: r.missedIngredients?.map(i => i.name) || [],
      recipeUrl: `https://spoonacular.com/recipes/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${r.id}`,
      vegetarian: dietMap[r.id]?.vegetarian ?? null,
      glutenFree: dietMap[r.id]?.glutenFree ?? null
    }));

    if (diet === "vegetarian") recipes = recipes.filter(r => r.vegetarian !== false);
    if (diet === "gluten free") recipes = recipes.filter(r => r.glutenFree !== false);

    return {
      statusCode: 200,
      body: JSON.stringify({ recipes, diet })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." })
    };
  }
};
