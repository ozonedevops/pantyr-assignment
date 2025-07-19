import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { ruruHTML } from '../node_modules/ruru/dist/server';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';

const app = express();
const port = 3000;

app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

app.all(
  '/graphql',
  createHandler({
    schema,
    rootValue: resolvers,
  })
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
