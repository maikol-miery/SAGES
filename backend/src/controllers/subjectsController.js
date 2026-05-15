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

module.exports = {
    getAllSubjects, 
    createSubject
}