// InventoryController.ts
import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventoryDTO } from '../types/inventory.type';

export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  async getInventory(_req: Request, res: Response): Promise<void> {
    try {
      const inventory = await this.inventoryService.getInventory();
      res.status(200).json(inventory);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve inventory', error: String(error) });
    }
  }



  async getAllBatches(req: Request, res: Response): Promise<void> {
    try {
      const batches = await this.inventoryService.getAllBatches();
      res.status(200).json(batches);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve all batches', error: String(error) });
    }
  }


  async getInventoryDetail(req: Request, res: Response): Promise<void> {
    const { produkId } = req.params; // Expect produkId as a route parameter
    try {
      const inventoryDetail = await this.inventoryService.getInventoryDetail(produkId);
      res.status(200).json(inventoryDetail);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve inventory details', error: String(error) });
    }
  }
  

  async getBatchDetails(req: Request, res: Response): Promise<void> {
    const { batchId } = req.params; // Use batchId instead of produkId
    try {
      const batchDetails = await this.inventoryService.getBatchDetails(batchId);
      res.status(200).json(batchDetails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve batch details', error: String(error) });
    }
  }

  async createBatch(req: Request, res: Response): Promise<void> {
    const batchData: InventoryDTO = req.body;
    try {
      const newBatch = await this.inventoryService.createBatch(batchData);
      res.status(201).json(newBatch);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create batch', error: String(error) });
    }
  }

  async updateBatch(req: Request, res: Response): Promise<void> {
    const { batchId } = req.params; // Use batchId instead of produkId
    const batchData: Partial<InventoryDTO> = req.body;
    try {
      const updatedBatch = await this.inventoryService.updateBatch(batchId, batchData);
      res.status(200).json(updatedBatch);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update batch', error: String(error) });
    }
  }

  async deleteBatch(req: Request, res: Response): Promise<void> {
    const { batchId } = req.params; // Use batchId instead of produkId
    try {
      await this.inventoryService.deleteBatch(batchId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete batch', error: String(error) });
    }
  }
}
