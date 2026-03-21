export interface IDatabaseAdmin {
  createTrackingTable(slug: string): Promise<void>
  dropTrackingTable(slug: string): Promise<void>
  executeSQL(query: string): Promise<void>
}
