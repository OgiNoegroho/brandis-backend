// inventoryRoutes.ts
import { Router } from 'express';
import { Pool } from 'pg';
import { InventoryModel } from '../models/inventory.model';
import { InventoryService } from '../services/inventory.service';
import { InventoryController } from '../controllers/inventory.controller';
import { authMiddleware } from '../middleware/auth';

export const inventoryRoutes = (dbPool: Pool): Router => {
  const router = Router();
  const inventoryModel = new InventoryModel(dbPool);
  const inventoryService = new InventoryService(inventoryModel);
  const inventoryController = new InventoryController(inventoryService);

  router.get('/inventory', authMiddleware, (req, res) => inventoryController.getInventory(req, res));


  router.get('/inventory/batch', authMiddleware, (req, res) => inventoryController.getAllBatches(req, res));
  
  router.get(
    '/inventory/:produkId', // Route expects produkId
    authMiddleware,
    (req, res) => inventoryController.getInventoryDetail(req, res)
  );
  


  router.get(
    '/inventory/batch/:batchId', // Changed to use batchId
    authMiddleware, 
    (req, res) => inventoryController.getBatchDetails(req, res)
  );
  router.post('/inventory/batch', authMiddleware, (req, res) => inventoryController.createBatch(req, res));
  router.put('/inventory/batch/:batchId', authMiddleware, (req, res) => inventoryController.updateBatch(req, res)); // Changed to use batchId
  router.delete('/inventory/batch/:batchId', authMiddleware, (req, res) => inventoryController.deleteBatch(req, res)); // Changed to use batchId

  return router;
};
