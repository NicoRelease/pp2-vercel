import sequelize from '../config/database.js'; 
import { DataTypes, Op } from 'sequelize'; 

// Importación de Modelos existentes
import UserModel from './User.js';
import SesionModel from './Sesion.js';
import TareaModel from './Tarea.js';

// Importación de Nuevos Modelos para el Onboarding Dinámico
import RolModel from './rol.js';
import GrupoModel from './grupo.js';
import WhitelistModel from './whitelist.js';
import GroupWhitelistModel from './groupwhitelist.js';

// Importar la función de asociaciones
import defineAssociations from './associations.js';

const db = {};

// 1. Inicializar Modelos de Soporte y Roles
db.Rol = RolModel(sequelize);
db.Grupo = GrupoModel(sequelize);
db.Whitelist = WhitelistModel(sequelize); // Whitelist Global (SysAdmins)
db.GroupWhitelist = GroupWhitelistModel(sequelize); // Whitelist por Grupo

// 2. Inicializar Modelos de Negocio
db.User = UserModel(sequelize);
db.Sesion = SesionModel(sequelize);
db.Tarea = TareaModel(sequelize);

// 3. Definir las Asociaciones (Relaciones)
// Pasamos el objeto 'db' completo para que 'defineAssociations' vea todas las tablas nuevas
defineAssociations(db);

// 4. Exportar los objetos clave
db.sequelize = sequelize; 
db.Sequelize = { DataTypes, Op }; // Agrupados para mayor claridad
db.Op = Op;

export default db;