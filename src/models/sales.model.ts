import { Pool } from "pg";
import { SaleDetail } from "../types/sales.type";

export class SalesModel {
  constructor(private db: Pool) {}

  async getSalesByOutlet(outlet_id: number) {
    const query = `
      SELECT 
        p.id AS penjualan_id,
        p.dibuat_pada,
        d.batch_id,
        d.kuantitas_terjual,
        b.nama AS batch_name,
        pr.nama AS product_name
      FROM brandis.penjualan p
      JOIN brandis.detail_penjualan d ON p.id = d.penjualan_id
      JOIN brandis.batch b ON d.batch_id = b.id
      JOIN brandis.produk pr ON b.produk_id = pr.id
      WHERE p.outlet_id = $1
      ORDER BY p.dibuat_pada DESC
    `;
    const result = await this.db.query(query, [outlet_id]);
    return result.rows;
  }

  async createSale(outlet_id: number, saleDetails: SaleDetail[]) {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN");

      const insertSaleQuery = `
        INSERT INTO brandis.penjualan (outlet_id) 
        VALUES ($1) 
        RETURNING id
      `;
      const saleResult = await client.query(insertSaleQuery, [outlet_id]);
      const saleId = saleResult.rows[0].id;

      for (const detail of saleDetails) {
        const { batch_id, kuantitas_terjual } = detail;

        // Insert sale detail
        const insertDetailQuery = `
          INSERT INTO brandis.detail_penjualan (penjualan_id, batch_id, kuantitas_terjual) 
          VALUES ($1, $2, $3)
        `;
        await client.query(insertDetailQuery, [
          saleId,
          batch_id,
          kuantitas_terjual,
        ]);

        // Reduce stock in the outlet
        const updateStockQuery = `
          UPDATE brandis.stok_outlet
          SET kuantitas = kuantitas - $1
          WHERE outlet_id = $2 AND batch_id = $3
        `;
        await client.query(updateStockQuery, [
          kuantitas_terjual,
          outlet_id,
          batch_id,
        ]);
      }

      await client.query("COMMIT");
      return { saleId, saleDetails };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getOutletStock(outlet_id: number) {
    const query = `
      SELECT 
        so.batch_id,
        so.kuantitas,
        b.nama AS batch_name,
        p.nama AS product_name
      FROM brandis.stok_outlet so
      JOIN brandis.batch b ON so.batch_id = b.id
      JOIN brandis.produk p ON b.produk_id = p.id
      WHERE so.outlet_id = $1
    `;
    const result = await this.db.query(query, [outlet_id]);
    return result.rows;
  }
}
