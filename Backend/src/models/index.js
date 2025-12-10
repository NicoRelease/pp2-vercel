import sequelize from '../config/database.js'; 
import { DataTypes } from 'sequelize'; 
import { Op } from 'sequelize';
// Importar las definiciones de todos los modelos
import UserModel from './User.js';
import SesionModel from './Sesion.js';
import TareaModel from './Tarea.js';
import LogModel from './Log.js';
// 1. Importa la función de asociaciones
import defineAssociations from './associations.js';

const db = {};

// 2. Inicializar cada modelo
db.User = UserModel(sequelize);
console.log('🔗 Modelo User cargado y asociado a Sequelize.');

db.Sesion = SesionModel(sequelize);
console.log('🔗 Modelo Sesion cargado y asociado a Sequelize.');

db.Tarea = TareaModel(sequelize);
console.log('🔗 Modelo Tarea cargado y asociado a Sequelize.');

db.Log = LogModel(sequelize);
console.log('🔗 Modelo Log cargado y asociado a Sequelize.');


// 3. Definir las Asociaciones (Relaciones)
// **¡LÍNEA DE CÓDIGO CLAVE!** Ejecuta la función para definir todas las relaciones.
defineAssociations(db);
console.log('🤝 Asociaciones definidas entre los modelos.');


// 4. Exportar los objetos clave
db.sequelize = sequelize; 
db.Sequelize = DataTypes; 
db.Op = Op;


export default db;