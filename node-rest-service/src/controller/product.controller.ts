import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { CreateProductDTO, createProductSchema } from "../schema/product.schema";

let products : Product[] = [
  { id: 1, name: "Laptop", category: "Electronics" },
  { id: 2, name: "Shirt", category: "Apparel" },
  { id: 3, name: "Coffee Maker", category: "Home Appliances" },
];

export const getProducts = (req: Request, res: Response): void => {
  res.json(products);
};

export const getProductById = (req: Request, res: Response): void => {
  const product = products.find(p => p.id === Number(req.params.id));
  if(!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }

  res.json(product);
};

export const createProduct = (req: Request, res: Response): void => {
  const newProduct: Product = {
    id: products.length + 1,
    ...req.body as CreateProductDTO
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

