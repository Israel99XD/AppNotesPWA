import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";
import methodOverride from "method-override";
import flash from "connect-flash";
import passport from "passport";
import morgan from "morgan";
import MongoStore from "connect-mongo";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import https from "https"; // Importar https
import fs from "fs"; // Importar fs
import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
config();

import { MONGODB_URI, PORT } from "./config.js";

import indexRoutes from "./routes/index.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import userRoutes from "./routes/auth.routes.js";
import "./config/passport.js";

// Initializations
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

// settings
app.set("port", PORT);
app.set("views", join(__dirname, "views"));

// config view engine
const hbs = exphbs.create({
  defaultLayout: "main",
  layoutsDir: join(app.get("views"), "layouts"),
  partialsDir: join(app.get("views"), "partials"),
  extname: ".hbs",
  helpers: {
    eq: function (a, b) {
      return a === b;
    },
  },
});
app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

// middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// routes
app.use(indexRoutes);
app.use(userRoutes);
app.use(notesRoutes);

// static files
app.use(express.static(join(__dirname, "public")));

// 404 handler
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

const firebaseConfig = {
  apiKey: "AIzaSyDgPMeNHu9NyWZY5UqILkDE9FuZTb0Vmhs",
  authDomain: "notesapp-6a645.firebaseapp.com",
  projectId: "notesapp-6a645",
  storageBucket: "notesapp-6a645.firebasestorage.app",
  messagingSenderId: "63030377599",
  appId: "1:63030377599:web:6438f11bb7289bd5a1934a",
  measurementId: "G-B0SNDQQ2HT"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);

// Leer los archivos de clave y certificado
const privateKey = fs.readFileSync(join(__dirname, "certs", "localhost.key"), "utf8");
const certificate = fs.readFileSync(join(__dirname, "certs", "localhost.crt"), "utf8");
const credentials = { key: privateKey, cert: certificate };

// Crea el servidor HTTPS
const server = https.createServer(credentials, app);

// Escuchar en el puerto definido en .env o por defecto en 4000
server.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
  console.log("MongoDB URI:", MONGODB_URI);
});

export default app;
