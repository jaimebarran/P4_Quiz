

const {log,biglog,errorlog,colorize} = require("./out");

const model = require('./model');



/*
 * Muestra la ayuda
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listar los quizzes existentes.");
    log(" show <id> - Muestra la pregunta y la respuesta del quiz indicado.");
    log(" add - Añadir un nuevo quiz interactivamente.");
    log(" delete <id> - Borrar el quiz indicado.");
    log(" edit <id> - Editar el quiz indicado.");
    log(" test <id> - Probar el quiz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes");
    log(" credits - Cŕeditos");
    log(" q|quit - Salir del programa");
    rl.prompt();
};



/*
 * Lista todos los quizzes existentes en el modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.listCmd = rl => {
    // log("Listar todos los quizzes existentes",'red');
    // Imprime por pantalla cada uno de los quizzes.
    model.getAll().forEach((quiz,id) => {
        log(` [${colorize(id,'magenta')}]: ${quiz.question}`);
});
    rl.prompt();
};


/*
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a mostrar
 */
exports.showCmd = (rl,id) => {
    // log("Mostrar el quiz indicado.",'red');
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        } catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/*
 * Añade un nuevo quiz al modelo.
 * Pregunta interactivamente por la pregunta y por la respuesta.
 *
 * Hay que recordar que el funcionamiento de la función rl.question es asíncrono
 * El prompt hay que sacarlo cuando ya se ha terminado la interacción con el usuario,
 * es decir, la llamada a rl.prompt() se debe hacer en la callback de la segunda
 * llamada a rl.question.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.addCmd = rl => {
    // log("Añadir un nuevo quiz.",'red');

    rl.question(colorize(' Introduzca una pregunta: ','red'),question => {
        rl.question(colorize(' Introduzca la respuesta: ','red'), answer => {
        model.add(question,answer);
    log(` ${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
    rl.prompt();
});
});

};


/*
 * Borra un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl,id) => {
    // log("Borrar el quiz indicado",'red');
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        } catch (error){
            errorlog(error.message);
        }
    }
    rl.prompt();
};

/*
 * Edita un quiz del modelo.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl,id) => {
    // log("Editar el quiz indicado.",'red');

    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try {
            const quiz = model.getByIndex(id); // Cojo la pregunta que quiero editar

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0); // Esto es para que no me cambie totalmente de pregunta

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0); // Esto es para que no me cambie totalmente de respuesta

            rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                model.update(id, question, answer);
            log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt(); // El prompt hay que retrasarlo hasta el momento adecuado
        });
        });
        }catch (error){
            errorlog(error.message);
            rl.prompt();
        }
    }

};

/*
 * Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 * @param id Clave del quiz a probar.
 */
exports.testCmd = (rl,id) => {
    // log("Probar el quiz indicado",'red');
    if(typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            rl.question(colorize(quiz.question +"? ",'red'), resp => {
                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
                log(`Su respuesta es: `);
                biglog('Correcta','green');
                rl.prompt();
            }else{
                log(`Su respuesta es: `);
                biglog('Incorrecta','red');
                rl.prompt();
            }
        });

        }catch (error) {
            errorlog(error.message);
            rl.prompt();
        }
    }
};

/*
 * Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
 * Se gana si se contesta a todos satisfactoriamente.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.playCmd = rl => {
    // log("Jugar.",'red');

    // Almacena cuántas preguntas se han ido acertando
    let score = 0;

    // Para no repetir las preguntas, creo un array donde pongo los índices de las preguntas que aún no se han preguntado
    let toBeSolved = [];
    for (let i=0;i<quizzes.length;i++){
        toBeSolved = toBeSolved.concat(i); // Meto valores de 0 hasta el nº de preguntas (que es la longitud de quizzes)
    }

    const playOne = () => {

        if (toBeSolved.length === 0){
            // Mensaje diciendo que no hay nada que preguntar
            log(`No hay más preguntas `);
            log(`Fin del examen. Aciertos: `);
            biglog(`${score}`,'green');
            rl.prompt();
        }else{
            // Pregunta al azar una de las que hay en el array
            let random = Math.floor( toBeSolved.length * Math.random() ); // Me devuelve un número aleatorio entre 0 y la longitud del array
            let id = toBeSolved[random]; // Asigno dicho número al valor del array correspondiente a dicho número
            let quiz = model.getByIndex(id);
            rl.question(colorize(quiz.question +"? ",'red'), resp => {
                if (resp.toLowerCase().trim() === quiz.answer.toLowerCase().trim() ){
                score++;
                // Quitar del array el valor id asociado a la pregunta
                toBeSolved.splice(random,1); // Elimino el número del array para que no me vuelva a aparecer
                log(`CORRECTO - Lleva ${score} aciertos. `);
                playOne(); // Llamada recursiva a playOne() para que vuelva a pasar
                rl.prompt();
            }else{
                log(`INCORRECTO.`);
                log(`Fin del examen. Aciertos:`);
                biglog(`${score}`,'red');
                rl.prompt();
            }
        });

        }
    }

    playOne();
};


/*
 * Muestra los nombres de los autores de la práctica.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.creditsCmd = rl => {
    log("Autor de la práctica: ");
    log("Jaime Barranco",'green');
    rl.prompt();
};

/*
 * Terminar el programa.
 *
 * @param rl Objeto readline usado para implementar el CLI.
 */
exports.quitCmd = rl => {
    rl.close();
};
