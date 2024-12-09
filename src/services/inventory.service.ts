import { InventoryDTO } from '../types/inventory.type';
import { InventoryModel } from '../models/inventory.model';

export class InventoryService {
  constructor(private inventoryModel: InventoryModel) {}

  getInventory() {
    return this.inventoryModel.getInventory();
  }

  
  getAllBatches() {
    return this.inventoryModel.getAllBatches();
  }

  getInventoryDetail(produkId: string) {
    return this.inventoryModel.getInventoryDetail(produkId);
  }
  


  getBatchDetails(batchId: string) { // Changed to batchId
    return this.inventoryModel.getBatchDetails(batchId);
  }

  createBatch(batchData: InventoryDTO) {
    return this.inventoryModel.createBatch(batchData);
  }

  updateBatch(batchId: string, batchData: Partial<InventoryDTO>) { // Changed to batchId
    return this.inventoryModel.updateBatch(batchId, batchData);
  }

  deleteBatch(batchId: string) { // Changed to batchId
    return this.inventoryModel.deleteBatch(batchId);
  }
}
