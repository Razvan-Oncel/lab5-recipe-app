const request = require("supertest");
const app = require("../server");

describe("GET /api/recipes", () => {

  test("400 if ingredients missing", async () => {
    const res = await request(app).get("/api/recipes");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("returns recipes", async () => {
    const res = await request(app).get("/api/recipes?ingredients=chicken");
    expect(res.statusCode).toBe(200);
    expect(res.body.recipes).toBeDefined();
  });

});