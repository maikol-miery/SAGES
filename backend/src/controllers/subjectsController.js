const { Subject, sequelize } = require('../models');
const { Op } = require('sequelize');

const createSubject = async (req, res) =>{
    try {
        
        const {
            abreviatura,
            nombre,
            grado
        } = req.body;

        const existing = await Subject.findOne({
            where: {
                [Op.or]: [
                    { nombre, grado }, 
                    { abreviatura }    
                ]
            }
        });

        if (existing) {
            return res.status(400).json({
                msg: "Ya existe una materia con ese nombre en este grado o esa abreviatura ya está en uso"
            });
        }

        const newSubject = await Subject.create({
            abreviatura,
            nombre,
            grado
        });

        return res.status(201).json({
            msg:`${nombre} creada de forma exitosa`,
            newSubject
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            msg:`no se pudo crear la materia`
        })
    }
}

const getAllSubjects = async(req, res) => {
    try {
        
        const allSubjects = await Subject.findAll({
            order: [['grado', 'ASC'], ['nombre', 'ASC']]
        });

        if(allSubjects.length === 0){
            return res.status(200).json({
                msg:"no hay materias registradas", 
            })
        }

        return res.status(200).json({
            subjects: allSubjects
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg:"no se puedo encontrar las meterias"
        })
    }
}

const updateSubject = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = { ...req.body };

    try {
        // 1. Buscamos la materia por ID
        const subject = await Subject.findByPk(id);

        if (!subject) {
            return res.status(404).json({
                status: 'error',
                message: 'La materia no se encuentra registrada en el sistema.'
            });
        }

        // 2. Protegemos el ID para evitar alteraciones accidentales
        delete dataToUpdate.id;

        // 3. Cargamos los datos limpios en memoria
        subject.set(dataToUpdate);

        // 4. Guardamos en Postgres solo si hubo cambios reales
        if (subject.changed()) {
            await subject.save();
        }

        // 5. Recargamos la instancia para reflejar los datos finales
        await subject.reload();

        return res.status(200).json({
            status: 'success',
            message: 'Materia actualizada con éxito.',
            data: { subject }
        });

    } catch (error) {
        console.error('Error al actualizar la materia:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al actualizar la materia.',
            error: error.message
        });
    }
};

// Recuerda exportarla al final de tu archivo junto a las otras:
module.exports = {
    getAllSubjects,
    createSubject,
    updateSubject // <--- Agregada aquí
};
