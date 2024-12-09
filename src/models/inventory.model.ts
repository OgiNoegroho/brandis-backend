// InventoryModel.ts
import { Pool, QueryResult } from 'pg';
import { BatchDetails, Inventory, InventoryDTO } from '../types/inventory.type';

export class InventoryModel {
  constructor(private dbPool: Pool) {}

  async getInventory(): Promise<Inventory[]> {
    const query = `
      SELECT 
        p.id AS produk_id,  -- Include product ID
        p.nama AS nama_produk, 
        COALESCE(SUM(b.kuantitas), 0) AS kuantitas, 
        CASE 
          WHEN COALESCE(SUM(b.kuantitas), 0) > 10 THEN 'In stock' 
          WHEN COALESCE(SUM(b.kuantitas), 0) BETWEEN 1 AND 10 THEN 'Low stock' 
          ELSE 'Out of stock' 
        END AS ketersediaan 
      FROM brandis.produk p
      LEFT JOIN brandis.batch b ON p.id = b.produk_id
      GROUP BY p.id, p.nama  -- Group by p.id to include it in the SELECT
    `;
    const result: QueryResult = await this.dbPool.query(query);
    return result.rows;
  }
  
  async getAllBatches(): Promise<BatchDetails[]> {
    const query = `
      SELECT 
        b.id AS batch_id,
        b.nama AS nama_batch,
        p.nama AS nama_produk,
        b.kuantitas,
        b.dibuat_pada,
        b.tanggal_kadaluarsa
      FROM 
        brandis.batch b
      JOIN 
        brandis.produk p
      ON 
        b.produk_id = p.id
      ORDER BY 
        b.id
    `;
    const result: QueryResult = await this.dbPool.query(query);
    return result.rows;
  }

  async getInventoryDetail(produkId: string): Promise<BatchDetails[]> {
    const query = `
      SELECT 
        b.id AS batch_id,
        b.nama AS nama_batch,
        b.kuantitas AS kuantitas_batch,
        b.tanggal_kadaluarsa,
        b.dibuat_pada AS produksi_pada
      FROM brandis.batch b
      WHERE b.produk_id = $1
      ORDER BY b.dibuat_pada
    `;
    const result: QueryResult = await this.dbPool.query(query, [produkId]);
    return result.rows;
  }
  



  async getBatchDetails(batchId: string): Promise<BatchDetails[]> {
    const query = `
      SELECT 
        b.id AS batch_id, 
        b.nama AS nama_batch, 
        p.nama AS nama_produk,
        b.kuantitas AS kuantitas_batch, 
        b.tanggal_kadaluarsa, 
        b.dibuat_pada, 
        b.diperbarui_pada
      FROM brandis.batch b
      JOIN brandis.produk p ON p.id = b.produk_id
      WHERE b.id = $1  -- Use batch_id to fetch batch details
      ORDER BY b.id
    `;
    const result: QueryResult = await this.dbPool.query(query, [batchId]);
    return result.rows;
  }

  async createBatch(batchData: InventoryDTO): Promise<BatchDetails> {
    const query = `
      INSERT INTO brandis.batch (nama, produk_id, kuantitas, tanggal_kadaluarsa, dibuat_pada, diperbarui_pada)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id AS batch_id, nama AS nama_batch, kuantitas AS kuantitas_batch, 
                tanggal_kadaluarsa, dibuat_pada, diperbarui_pada, produk_id
    `;
    const { nama, produk_id, kuantitas, tanggal_kadaluarsa } = batchData;
    const result: QueryResult = await this.dbPool.query(query, [
      nama,
      produk_id,
      kuantitas,
      tanggal_kadaluarsa,
    ]);
  
    const batch = result.rows[0];

    // Retrieve the product name for the created batch
    const productQuery = `
      SELECT nama FROM brandis.produk WHERE id = $1
    `;
    const productResult = await this.dbPool.query(productQuery, [batch.produk_id]);

    return { ...batch, nama_produk: productResult.rows[0]?.nama || 'Unknown Product' };
  }

  async updateBatch(batchId: string, batchData: Partial<InventoryDTO>): Promise<BatchDetails> {
    const fields = Object.keys(batchData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE brandis.batch
      SET ${fields}, diperbarui_pada = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id AS batch_id, nama AS nama_batch, kuantitas AS kuantitas_batch, 
                tanggal_kadaluarsa, dibuat_pada, diperbarui_pada, produk_id
    `;
    
    const values = [batchId, ...Object.values(batchData)];
    const result: QueryResult = await this.dbPool.query(query, values);

    const updatedBatch = result.rows[0];

    const productQuery = `
      SELECT nama FROM brandis.produk WHERE id = $1
    `;
    const productResult = await this.dbPool.query(productQuery, [updatedBatch.produk_id]);

    return { ...updatedBatch, nama_produk: productResult.rows[0]?.nama || 'Unknown Product' };
  }

  async deleteBatch(batchId: string): Promise<void> {
    const query = `
      DELETE FROM brandis.batch
      WHERE id = $1
    `;
    await this.dbPool.query(query, [batchId]);
  }
}
