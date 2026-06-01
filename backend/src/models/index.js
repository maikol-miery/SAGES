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
Representative.hasMany(Student, { foreignKey: 'representative_id' }); // (Si en la BD es representative_id, cámbialo aquí también)
Student.belongsTo(Representative, { foreignKey: 'representative_id' });

// 2. Inscripción: Relación Estudiante - Sección (M:N a través de Registration)
Student.belongsToMany(Section, { through: Registration, foreignKey: 'student_id'});
Section.belongsToMany(Student, { through: Registration, foreignKey: 'section_id'});

// Relaciones directas para facilitar consultas (Eager Loading)
Registration.belongsTo(Student, { foreignKey: 'student_id' });
Registration.belongsTo(Section, { foreignKey: 'section_id' });
Student.hasMany(Registration, { foreignKey: 'student_id' });
Section.hasMany(Registration, { foreignKey: 'section_id' });

// 3. Carga Académica: Relación Profesor - Materia - Sección (M:N)
Teacher.belongsToMany(Subject, { through: AcademicLoad });
Subject.belongsToMany(Teacher, { through: AcademicLoad });

Teacher.belongsToMany(Section, { through: AcademicLoad });
Section.belongsToMany(Teacher, { through: AcademicLoad });

// Relaciones directas de Carga Académica
AcademicLoad.belongsTo(Teacher, { foreignKey: 'teacher_id' });
AcademicLoad.belongsTo(Subject, { foreignKey: 'subject_id' });
AcademicLoad.belongsTo(Section, { foreignKey: 'section_id' });

Teacher.hasMany(AcademicLoad, { foreignKey: 'teacher_id' });
Subject.hasMany(AcademicLoad, { foreignKey: 'subject_id' });
Section.hasMany(AcademicLoad, { foreignKey: 'section_id' });

// 4. Calificaciones: Relación Estudiante - Materia - Sección (1:N)
Student.hasMany(Qualification, { foreignKey: 'student_id' });
Qualification.belongsTo(Student, { foreignKey: 'student_id' });

// NUEVA RELACIÓN: Carga Académica - Calificación
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
    Teacher,
    Registration,
    Qualification,
    AcademicLoad
};