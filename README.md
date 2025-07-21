# Pantyr Assignment
This repository contains a skeleton of an Express application written in TypeScript as a basis for an API of a web store.

## Getting Started
To work on this assignment, you need to fork this repository. After that and cloning the fork, you should run `npm i` to install the dependencies. It is recommended to use Volta to have the correct versions of Node and NPM, but it is not required. To install Volta, follow the instruction on [Volta: Getting Started](https://docs.volta.sh/guide/getting-started).

After installation is complete, you can start the app by either `npm start` or `npm start:watch`. The latter is useful during development, as it watches the source files and restart the server if there are any changes.

Once you're done with the assignment, create a PR to merge in the `main` branch of this repository.

## Assignment
Our store sells products, but currently there is no way for customers to place any orders. Your assignment is to implement a GraphQL API with the following:
- a paginated query that returns a list of products
- a mutation to place orders

Our database consists of JSON files in the `db` folder. We currently have a collection of [products](./db/products.json) and an [empty collection](./db/orders.json) for our incoming orders. You can read the JSON files into memory (since there aren't that many items) or you can setup an actual database and use those files as your seed data.

*Bonus points: Apply filtering and ordering to the products list*

*Super bonus points: Add extra queries/mutations that would be fitting for a web store*


## Solution
Implemented GraphQL API with the following:

### Query
- a paginated query that returns a list of products

### Mutation
- a mutation to place orders (validate order quantity does not exceed available stock)

### Bonus
- filtering product list by "price" (min/max)
- filtering product list by "title contains"
- sorting product list by product "title" 
- sorting product list by product "price"

### Super Bonus
- a query to show a single product of interest by id
- a query to show orders by user
- a query to show products that have a low stock
- a query to show store metrics (total orders and total revenue)
- a mutation to update product stock (validate stock is positive integer)
- a mutation to update product price (validate price is positive)
- a mutation to update product title (validate title is not empty)
- a mutation to add new product (validate stock is positive integer, price is positive, title is not empty, auto assign product ID)

## Usage
- clone the https://github.com/ozonedevops/pantyr-assignment repository to your machine
- install nodeJS `https://nodejs.org/en/download`
- open a terminal in the pantyr-assignment directory and install the dependencies (run `npm i` )
- After installation is complete, you can start the app by `npm run start:watch`
- open a browser and go to: `http://localhost:3000/` This wil open ruru for testing the GraphQL api created in the Pantyr assignment.
- for direct interfacing with the API use `http://localhost:3000/graphql`

## Preview
![Screenshot of ruru explorer for testing GraphQL API.](/screenshots/Pantyr-assignment-GraphQL-test-using-ruru.png)