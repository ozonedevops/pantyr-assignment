import { promises as fs } from 'fs';
import path from 'path';
import { IProduct } from '../interfaces/product';
import { IOrder } from '../interfaces/order';

const productsPath = path.join(__dirname, '../../db/products.json');
const ordersPath = path.join(__dirname, '../../db/orders.json');

// Get products from JSON file
export async function getProducts(): Promise<IProduct[]> {
  const raw = await fs.readFile(productsPath, 'utf-8');
  const parsed: IProduct[] = JSON.parse(raw);

  return parsed.map(p => ({ ...p, stock: p.stock ?? 100 }));
}

export async function saveProducts(products: IProduct[]): Promise<void> {
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf-8');
}

// Get orders from JSON file
export async function getOrders(): Promise<IOrder[]> {
  try {
    const raw = await fs.readFile(ordersPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save orders to JSON file
export async function saveOrders(orders: IOrder[]): Promise<void> {
  await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf-8');
}
