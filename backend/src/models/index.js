const sequelize = require('../databases/db_config');

// Importar los modelos
const User = require('./User');
const Student = require('./Student');
const Representative = require('./Representative');
const Subject = require('./Subject');
const Section = require('./Section');
const Teacher = require('./Teacher');
const Registration = require('./Registration');
const Qualification = require('./Qualification');
const AcademicLoad = require('./AcademicLoad');

// --- DEFINICIÓN DE RELACIONES ---

// 1. Relación Estudiante - Representante (1:N)
Representative.hasMany(Student, { foreignKey: 'RepresentativeId' });
Student.belongsTo(Representative, { foreignKey: 'RepresentativeId' });

// 2. Inscripción: Relación Estudiante - Sección (M:N a través de Registration)
Student.belongsToMany(Section, { through: Registration });
Section.belongsToMany(Student, { through: Registration });

// Relaciones directas para facilitar consultas (Eager Loading)
Registration.belongsTo(Student);
Registration.belongsTo(Section);
Student.hasMany(Registration);
Section.hasMany(Registration);

// 3. Carga Académica: Relación Profesor - Materia - Sección (M:N)
Teacher.belongsToMany(Subject, { through: AcademicLoad });
Subject.belongsToMany(Teacher, { through: AcademicLoad });

Teacher.belongsToMany(Section, { through: AcademicLoad });
Section.belongsToMany(Teacher, { through: AcademicLoad });

// Relaciones directas de Carga Académica
AcademicLoad.belongsTo(Teacher);
AcademicLoad.belongsTo(Subject);
AcademicLoad.belongsTo(Section);
Teacher.hasMany(AcademicLoad);
Subject.hasMany(AcademicLoad);
Section.hasMany(AcademicLoad);

// 4. Calificaciones: Relación Estudiante - Materia - Sección (1:N)
Student.hasMany(Qualification);
Qualification.belongsTo(Student);

Subject.hasMany(Qualification);
Qualification.belongsTo(Subject);

Section.hasMany(Qualification);
Qualification.belongsTo(Section);

// Exportar todo el objeto para usarlo en controladores
module.exports = {
    sequelize,
    User,
    Student,
    Representative,
    Subject,
    Section,
    Teacher,
    Registration,
    Qualification,
    AcademicLoad
};