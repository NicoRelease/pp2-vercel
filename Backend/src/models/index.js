import sequelize from '../config/database.js'; 
import { DataTypes } from 'sequelize'; 
import { Op } from 'sequelize';
import UserModel from './User.js';
import SesionModel from './Sesion.js';
import TareaModel from './Tarea.js';
//import LogModel from './Log.js';
// 1. Importa la función de asociaciones
import defineAssociations from './associations.js';

const db = {};

// 2. Inicializar cada modelo
db.User = UserModel(sequelize);

db.Sesion = SesionModel(sequelize);

db.Tarea = TareaModel(sequelize);

//db.Log = LogModel(sequelize);

// 3. Definir las Asociaciones (Relaciones)
// Ejecuta la función para definir todas las relaciones.
defineAssociations(db);


// 4. Exportar los objetos clave
db.sequelize = sequelize; 
db.Sequelize = DataTypes; 
db.Op = Op;


export default db;