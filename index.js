const express = require('express');
const server = express();
// const bodyParser = require('body-parser');

server.use(express.json());
// server.use(bodyParser.json());

const projetos = [];
var countReq = 0;

function validIdTitleBody(req, res, next){
  if ((!req.body.id) || (!req.body.title)){
    return res.status(400).json({error: "id and title are required"})
  }
  return next();
}

function validIdParams(req, res, next){
  const { id } = req.params;
  if (!id){
    return res.status(400).json({error: "id is required"})
  }
  req.id = id;
  return next();
}

function validIdExist(req, res, next){
  const { id} = req.params;
  var encontrou = false;
  projetos.forEach(projeto => {
    if(projeto.id == id){
      encontrou = true;
    }
  });

  return encontrou ? next() : res.status(400).json({error: "Project does not exists"});

}

// Crie um middleware global chamado em todas requisições que imprime (console.log) uma contagem
// de quantas requisições foram feitas na aplicação até então
server.use((req, res, next) => {
  console.log(`A requisição foi chamada ${countReq}`);
  countReq++;
  next();
})

function updateProject(id, titulo){
var retorno = false;
  projetos.forEach(projeto => {
    if(projeto.id == id){
      projeto.title = titulo;
      retorno = projeto;
    }
  });
  return retorno;
}

function deleteValue(id){
  var retorno = false;
    for (let index = 0; index < projetos.length; index++) {
      if(projetos[index].id == id){
        projetos.splice(index,1);
        retorno = true;
      }
    }

    return retorno;
  }

function addTask(id, title){
  var retorno = false;
  projetos.forEach(projeto => {
    if(projeto.id == id){
      projeto.tasks.push(title);
      retorno = projeto;
    }
  });
  return retorno;
}


server.post('/projects', validIdTitleBody, (req, res) => {
  projetos.push(req.body);
  return res.json({message: "Projeto adicionado com sucesso!"});
})

server.get('/projects', (req, res)=> {
  return res.json(projetos);
})

// PUT /projects/:id: A rota deve alterar apenas o título do projeto com o id 
// presente nos parâmetros da rota;
server.put('/projects/:id', validIdParams, validIdExist, (req, res) => {
  const { title } = req.body;
  const projeto = updateProject(req.id, title);
  if(!projeto){
    return res.status(400).json({error: "Project does not exists"});
  }
  return res.json(projeto);

})

// DELETE /projects/:id: A rota deve deletar o projeto com o id presente nos parâmetros da rota;
server.delete('/projects/:id', validIdExist, validIdParams, (req, res) => {
  return deleteValue(req.id) ? res.send() : res.status(400).json({error: "An error has occurred"});
})

// POST /projects/:id/tasks: A rota deve receber um campo title e armazenar uma nova tarefa no
// array de tarefas de um projeto específico escolhido através do id presente nos parâmetros da rota;
server.post('/projects/:id/tasks', validIdExist, (req, res) =>{
  const { title } = req.body;
  const { id } = req.params;
  const projeto = addTask(id, title);

  if(!projeto){
    return res.status(400).json({error: "Project does not exists"});
  }
  
  return res.json(projeto);
})

server.listen(3000);