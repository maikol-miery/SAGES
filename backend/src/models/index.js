// backend/src/models/index.js
const sequelize = require('../databases/db_config');

// Importar los modelos
const User = require('./User');
const Student = require('./Student');
const Representative = require('./Representative');
const Subject = require('./Subject');
const Section = require('./Section');
const Staff = require('./Staff'); 
const Registration = require('./Registration');
const Qualification = require('./Qualification');
const AcademicLoad = require('./AcademicLoad');

// --- DEFINICIÓN DE RELACIONES ---

// 0. RELACIÓN: Usuario - Staff (1:1)
// Conecta la cuenta de acceso con el perfil físico (sea docente, secretaria o admin)
Staff.hasOne(User, { foreignKey: 'staff_id', as: 'cuenta' });
User.belongsTo(Staff, { foreignKey: 'staff_id', as: 'perfil' });


// 1. Relación Estudiante - Representante (1:N)
Representative.hasMany(Student, { foreignKey: 'representative_id' });
Student.belongsTo(Representative, { foreignKey: 'representative_id', as: 'Representative'});


// 2. Inscripción: Relación Estudiante - Sección (M:N a través de Registration)
Student.belongsToMany(Section, { through: Registration, foreignKey: 'student_id', otherKey: 'section_id' });
Section.belongsToMany(Student, { through: Registration, foreignKey: 'section_id', otherKey: 'student_id' });

// Relaciones directas para facilitar consultas (Eager Loading)
Registration.belongsTo(Student, { foreignKey: 'student_id' });
Registration.belongsTo(Section, { foreignKey: 'section_id' });
Student.hasMany(Registration, { foreignKey: 'student_id' });
Section.hasMany(Registration, { foreignKey: 'section_id' });


// 3. Carga Académica: Relación Staff (Docente) - Materia - Sección (M:N)
// Mapeo explícito con 'staff_id' para evitar duplicación de columnas en AcademicLoad
Staff.belongsToMany(Subject, { through: AcademicLoad, foreignKey: 'staff_id', otherKey: 'subject_id' });
Subject.belongsToMany(Staff, { through: AcademicLoad, foreignKey: 'subject_id', otherKey: 'staff_id' });

Staff.belongsToMany(Section, { through: AcademicLoad, foreignKey: 'staff_id', otherKey: 'section_id' });
Section.belongsToMany(Staff, { through: AcademicLoad, foreignKey: 'section_id', otherKey: 'staff_id' });

// Relaciones directas de Carga Académica
AcademicLoad.belongsTo(Staff, { foreignKey: 'staff_id', as: 'docente' });
AcademicLoad.belongsTo(Subject, { foreignKey: 'subject_id' });
AcademicLoad.belongsTo(Section, { foreignKey: 'section_id' });

Staff.hasMany(AcademicLoad, { foreignKey: 'staff_id' });
Subject.hasMany(AcademicLoad, { foreignKey: 'subject_id' });
Section.hasMany(AcademicLoad, { foreignKey: 'section_id' });


// 4. Calificaciones: Relación Estudiante - Materia - Sección (1:N)
Student.hasMany(Qualification, { foreignKey: 'student_id' });
Qualification.belongsTo(Student, { foreignKey: 'student_id' });

// Relación: Carga Académica - Calificación
AcademicLoad.hasMany(Qualification, { foreignKey: 'academic_load_id' });
Qualification.belongsTo(AcademicLoad, { foreignKey: 'academic_load_id' });


// Exportar todo el objeto para usarlo en controladores
module.exports = {
    sequelize,
    User,
    Student,
    Representative,
    Subject,
    Section,
    Staff, 
    Registration,
    Qualification,
    AcademicLoad
};