const { Section, AcademicLoad, Registration, sequelize } = require('../models');

const createSection = async (req, res) =>{
    try {
        
        const {grado, seccion, anio_escolar} = req.body;

        const existingSection = await Section.findOne({
            where: {grado, seccion, anio_escolar}
        })

        if(existingSection){
            return res.status(400).json({
                msg: `la seccion ${seccion} de ${grado} para el año escolar ${anio_escolar}, ya se encuentra creada`
            })
        }

        const newSection = await Section.create({
            grado,
            seccion,
            anio_escolar
        })

        return res.status(201).json({
            status:"success",
            msg:"Sección creada de forma exitosa",
            section: newSection
        })

    } catch (error) {
        console.error(`error al crear la seccion: ${error}`)
        return res.status(500).json({
            msg:"Error al registrar la sección"
        })
    }
}

const getAllSections = async (req, res) =>{
    try {
        
        const allSections = await Section.findAll({
            order:[["grado", "ASC"],["seccion", "ASC"]]
        });

        if(allSections.length === 0){
            return res.status(400).json({
                msg:"No hay secciones creadas"
            })
        }

        return res.status(200).json({
            sections: allSections
        })

    } catch (error) {
        console.error(`error al encontrar secciones: ${error}`);
        return res.status(500).json({
            msg:"error al encontrar las secciones"
        })
    }
}

const updateSection = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    try {
        // 1. Buscamos la sección por ID
        const section = await Section.findByPk(id);

        if (!section) {
            return res.status(404).json({
                status: 'error',
                message: 'La sección no se encuentra registrada en el sistema.'
            });
        }

        // 2. Protegemos el ID contra modificaciones accidentales
        delete dataToUpdate.id;

        // 3. Cargamos los datos limpios y trimeados en memoria
        section.set(dataToUpdate);

        // 4. Guardamos en la base de datos solo si hubo cambios verdaderos
        if (section.changed()) {
            await section.save();
        }

        // 5. Refrescamos la instancia antes de responder
        await section.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Sección actualizada con éxito.',
            data: { section }
        });

    } catch (error) {
        console.error('Error al actualizar la sección:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al actualizar la sección.',
            error: error.message
        });
    }
};

const deleteSection = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Buscar si la sección existe
    const section = await Section.findByPk(id);
    if (!section) {
      return res.status(404).json({ msg: 'La sección no existe.' });
    }

    // 2. REGLA 1: Validar si tiene materias asociadas en la carga académica
    // Nota: Asegúrate de que 'sectionId' coincida con tu FK en AcademicLoad
    const hasSubjects = await AcademicLoad.findOne({ where: { section_id: id } });
    if (hasSubjects) {
      return res.status(409).json({ 
        msg: `No se puede eliminar la Sección ${section.seccion} porque tiene materias asignadas en la distribución de carga.` 
      });
    }

    // 3. REGLA 2: Validar si tiene estudiantes inscritos en ella
    // Nota: Asegúrate de que 'sectionId' coincida con tu FK en Student
    const hasStudents = await Registration.findOne({ where: { section_id: id } });
    if (hasStudents) {
      return res.status(409).json({ 
        msg: `No se puede eliminar la Sección ${section.seccion} porque tiene alumnos inscritos en este ciclo.` 
      });
    }

    // 4. Si pasa ambas validaciones, borrado físico estricto
    await section.destroy();

    return res.status(200).json({ 
        status:"success",
        msg: `La sección "${section.seccion}" fue eliminada correctamente del sistema.` 
    });

  } catch (error) {
    console.error('Error en deleteSection:', error);
    return res.status(500).json({ 
        status:"error",
        msg: 'Error interno del servidor al intentar eliminar la sección.' 
    });
  }
};

// Exportamos junto a las que ya tenías
module.exports = {
    createSection,
    getAllSections,
    updateSection,
    deleteSection 
};
