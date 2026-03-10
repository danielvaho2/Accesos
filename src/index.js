import express from "express";

import { dirname, join } from "path";
import {fileURLToPath} from 'url';
import uploadRoutes  from './routes/upload.js';

import indexRoutes from './routes/index.js';

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("views", join(__dirname,'views'));
app.set("view engine", "ejs");

app.use(indexRoutes);
app.use('/upload', uploadRoutes );
app.use(express.static(join(__dirname,'public')));
app.listen(3000, "0.0.0.0");

console.log("el servidor esta en puerto 3000");