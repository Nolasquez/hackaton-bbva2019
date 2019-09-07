var express = require ('express');
var bodyParser = require ('body-parser');
const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver('bolt://localhost:11002', neo4j.auth.basic('neo4j', 'bbva2019'));
const session = driver.session();

const app = express();

app.get('/api/v1/downRelatioship/', (req, res) => {

  const fraudClient = req.get('fraud');
  
  if(fraudClient.length !== 8) {
    return res.status(400).send({
      success: 'false',
      message: 'Longitud del parámetro debe de ser 8 '
    });
  }

  const resultPromise = session.run(
    'MATCH (john:Person { name:$name})-[:RECOMENDED]->(b: Person) RETURN b.name',
    {name: fraudClient}
  );

  resultPromise.then(result => {
    session.close();

    if(result.records.length == 0) {
      return res.status(204).send({
        success: 'false',
        message: 'Sin información de relación'
      });
    } else {
      result.records
      return res.status(200).send({
        success: 'true',
        message: 'Cliente con relaciones',
        data: result.records
      });
    }   
    driver.close();
  });
});


app.get('/api/v1/upRelatioship/', (req, res) => {

  const fraudClient = req.get('fraud');
  
  if(fraudClient.length !== 8) {
    return res.status(400).send({
      success: 'false',
      message: 'Longitud del parámetro debe de ser 8 '
    });
  }

  const resultPromise = session.run(
    'MATCH (john:Person { name:$name})<-[:RECOMENDED]-(b: Person) RETURN b.name',
    {name: fraudClient}
  );

  resultPromise.then(result => {
    session.close();

    if(result.records.length == 0) {
      return res.status(204).send({
        success: 'false',
        message: 'Sin información de relación'
      });
    } else {
      return res.status(200).send({
        success: 'true',
        message: 'Cliente con relaciones',
        data: result.records
      });
    }   
    driver.close();
  });
});


app.post('/api/v1/createRelationship/', (req, res) => {
  const issuerName = req.get('issuer');
  const endorserName = req.get('endorser'); 
  
  if(issuerName.length != 8 || endorserName.length != 8 ) {
    return res.status(400).send({
      success: 'false',
      message: 'Longitud del parámetro debe de ser 8 '
    });
  }
  if(issuerName == endorserName) {
    return res.status(400).send({
      success: 'false',
      message: 'Firmante debe de ser diferente'
    });
  }

  const _request = 'match (a:Person {name:"'+issuerName+'"}), (b:Person {name:"'+endorserName+'"}) merge (a)-[r:RECOMENDED]->(b) return a,b';
  console.log(_request);
  const resultPromise = session.run(_request);

  resultPromise.then(result => {
    session.close();
    console.log(result);

    if(result.records.length == 0) {
      return res.status(400).send({
       success: 'false',
        message: 'Error al crear el cliente'
      });
    } else {
      return res.status(201).send({
        success: 'true',
        message: 'Relación creada con exito'
      });
    } 
    driver.close();
  });
});


app.get('/api/v1/createClient/:id', (req, res) => {
  const personName = req.params.id ; 
  
  if(personName.length !== 8) {
    return res.status(400).send({
      success: 'false',
      message: 'Longitud del parámetro debe de ser 8 '
    });
  }

  const resultPromise = session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    {name: personName}
  );

  resultPromise.then(result => {
    session.close();

    if(result.records.length == 0) {
      return res.status(400).send({
       success: 'false',
        message: 'Error al crear el cliente'
      });
    } else {
      return res.status(200).send({
        success: 'true',
        message: 'Cliente creado con exito'
      });
    }   
    driver.close();
  });
});

app.get('/api/v1/existClient/:id', (req, res) => {
  const personName = req.params.id ; 
  if(personName.length !== 8) {
    return res.status(400).send({
      success: 'false',
      message: 'Longitud del parámetro debe de ser 8 '
    });
  } 
  const resultPromise = session.run(
    'match (n:Person) where n.name = $name return n.name', 
    {name: personName}
  );
  resultPromise.then(result => {
    session.close();
    console.log(result);
    if(result.records.length == 0) {
      return res.status(400).send({
        success: 'false',
        message: 'No existe cliente'
      });
    } else {
      return res.status(200).send({
        success: 'true',
        message: 'Cliente existe'
      });
    }   
    driver.close();
  }).catch(function(error){
    console.log(error);
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});