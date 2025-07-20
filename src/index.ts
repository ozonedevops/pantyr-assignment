import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { ruruHTML } from '../node_modules/ruru/dist/server';
import schema from './graphql/schema';
import resolvers from './graphql/resolvers';

const app = express();
const port = 3000;

// Enable CORS for all origins (or restrict to 'http://localhost:5173')
app.use(cors({ origin: 'http://localhost:5173' }));

// Optional: Serve GraphiQL IDE
app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

// GraphQL HTTP endpoint
app.all(
  '/graphql',
  createHandler({
    schema,
    rootValue: resolvers,
  })
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

