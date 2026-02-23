import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 10, 10);

export default (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: { 
            type: DataTypes.STRING, 
            allowNull: false,
        },
        email: { 
            type: DataTypes.STRING, 
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: 'Debe ser un correo electrónico válido.' }
            }
        },
        password: { 
            type: DataTypes.STRING, 
            allowNull: false
        },
        // Relación con la tabla 'rol'
        rol_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'rol',
                key: 'id'
            }
        },
        // Relación con la tabla 'grupo' (Instancia)
        group_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'grupo',
                key: 'id'
            }
        },
        // Estado: Activo (true) o Inactivo (false)
        estado: {
            type: DataTypes.BOOLEAN,
            defaultValue: false // Por defecto inactivo hasta validación de whitelists
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'users',
        timestamps: false,
        
        hooks: {
            // Se ejecuta antes de crear el usuario (útil si el hash viene del service o se hace aquí)
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
                }
            },
            // Se ejecuta al actualizar la contraseña
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS);
                }
            }
        }
    });

    // Método para comparar contraseñas en el Login
    User.prototype.validPassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    // ===============================================
    // 🔗 ASOCIACIONES (RELACIONES)
    // ===============================================
    User.associate = function(models) {
        // Un usuario pertenece a un ROL
        User.belongsTo(models.Rol, { foreignKey: 'rol_id', as: 'rol' });
        
        // Un usuario pertenece a un GRUPO (Instancia)
        User.belongsTo(models.Grupo, { foreignKey: 'group_id', as: 'grupo' });
        
        // Un usuario tiene muchas SESIONES
        User.hasMany(models.Sesion, { foreignKey: 'user_id', as: 'sesiones' });
    };

    return User;
};