
const Sequelize = require('sequelize'); // Cargo el módulo Sequelize

const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false}); // Genero una instancia de Sequelize para acceder a la base de datos
                                                          // con url sqlite:quizzes.sqlite. Ruta al fichero: quizzes.sqlite

sequelize.define('quiz', {    // Defino modelo de datos llamado quiz, con preguntas y respuestas
    question: {
        type: Sequelize.STRING,
        unique: {msg:"Ya existe esta pregunta"},  // Cada pregunta ha de ser única. Por defecto unique es true.
        validate: {notEmpty: {msg: "La pregunta no puede estar vacía"}}
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía"}}
    }
});


sequelize.sync()   // El método sync() sincroniza la BBDD (fichero quizzes.sqlite) con el modelo (model.js). Crea la tabla 'quizzes' cuando no existe.
.then( () => sequelize.models.quiz.count() )   // Obtiene el número de elementos de la tabla quizzes
.then( count => {
    if (!count){ // Si no hay ninguna pregunta, creamos 4 preguntas iniciales
        return sequelize.models.quiz.bulkCreate([  // Para crear varios quizzes pasados en un array
            { question: "Capital de Italia", answer: "Roma"},
            { question: "Capital de Francia", answer: "París"},
            { question: "Capital de España", answer: "Madrid"},
            { question: "Capital de Portugal", answer: "Lisboa"}
        ]);
    }
})
.catch(error => {
    console.log(error);
});

module.exports = sequelize;