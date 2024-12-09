import app from "./app.js";
import { createAdminUser } from "./libs/createUser.js";
import "./database.js";

async function main() {
  await createAdminUser();
  // Eliminar esta línea, ya que no se necesita escuchar el puerto aquí
  // app.listen(app.get("port"));

  console.log("Environment:", process.env.NODE_ENV);
}

main();
