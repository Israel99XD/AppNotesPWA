import { config } from "dotenv";
config();

export const PORT = process.env.PORT || 4000;
export const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://seriscompany:cPsPUFaEUiMoOOdb@cluster0.pnfekrf.mongodb.net/Ordenes";
