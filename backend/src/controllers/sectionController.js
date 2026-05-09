const { Section, sequelize } = require('../models');

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

module.exports = {
    createSection,
    getAllSections
}
