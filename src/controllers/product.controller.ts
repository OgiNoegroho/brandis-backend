import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ProductDTO } from '../types/product.type';

export class ProductController {
  constructor(private productService: ProductService) {}

  private handleError(res: Response, error: unknown, defaultMessage: string): void {
    const message = error instanceof Error ? error.message : defaultMessage;
    res.status(500).json({ error: message });
  }

  // Add a new product
  addProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const productData: ProductDTO = req.body;
      const imageFile = req.file; // Multer middleware handles file upload
      const product = await this.productService.addProduct(productData, imageFile);
      res.status(201).json(product);
    } catch (error) {
      this.handleError(res, error, 'Failed to add product');
    }
  };

  // Get all products with images
  getAllProducts = async (_req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve products');
    }
  };

  // Get a product by ID with images
  getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await this.productService.getProductById(id);
      if (product) {
        res.status(200).json(product);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      this.handleError(res, error, 'Failed to retrieve product');
    }
  };

  // Update a product and its image
  editProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const productData: ProductDTO = req.body;
      const imageFile = req.file; // Multer middleware handles file upload
      const updated = await this.productService.updateProduct(id, productData, imageFile);
      if (updated) {
        res.status(200).json({ message: 'Product updated successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      this.handleError(res, error, 'Failed to update product');
    }
  };

  // Delete a product and its associated images
  removeProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = String(req.params.id);
      const deleted = await this.productService.deleteProduct(id);
      if (deleted) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (error) {
      this.handleError(res, error, 'Failed to delete product');
    }
  };
}