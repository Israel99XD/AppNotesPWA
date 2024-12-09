import * as functions from "firebase-functions";
import express from "express";
import { initializeApp } from "firebase-admin/app";
import { getAnalytics } from "firebase-admin/analytics";
import { join } from "path";
import { fileURLToPath } from "url";
import exphbs from "express-handlebars";
import morgan from "morgan";
import session from "express-session";
import methodOverride from "method-override";
import passport from "passport";
import flash from "connect-flash";
import MongoStore from "connect-mongo";

// Import your routes here
import indexRoutes from "./routes/index.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import userRoutes from "./routes/auth.routes.js";

// Initialize Firebase Admin
initializeApp();
const app = express();

// Set view engine
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: join(__dirname, "views", "layouts"),
  partialsDir: join(__dirname, "views", "partials"),
  extname: ".hbs",
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", join(__dirname, "views"));

// Middlewares and routes
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: "your_mongo_uri_here" })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(indexRoutes);
app.use(userRoutes);
app.use(notesRoutes);

// Serve static files
app.use(express.static(join(__dirname, "public")));

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  return res.status(404).render("404");
});

// Error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render("error", {
    error,
  });
});

// Export Express app to Firebase Functions
export const appFunction = functions.https.onRequest(app);
