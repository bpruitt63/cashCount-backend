const app = require("./app");
const { PORT } = require("./config");

app.listen(`0.0.0.0:${PORT}`, function () {
  console.log(`Started on http://localhost:${PORT}`);
});