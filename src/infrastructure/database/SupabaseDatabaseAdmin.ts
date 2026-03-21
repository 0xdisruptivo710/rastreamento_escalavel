import { IDatabaseAdmin } from '@/domain/interfaces/IDatabaseAdmin'
import { TableCreationError } from '@/domain/errors/TableCreationError'
import { createAdminClient } from './supabase/admin'
import { Slug } from '@/domain/value-objects/Slug'

export class SupabaseDatabaseAdmin implements IDatabaseAdmin {
  private getClient() {
    return createAdminClient()
  }

  async createTrackingTable(slug: string): Promise<void> {
    const sanitized = Slug.sanitize(slug)
    const tableName = `Rastreamento_${sanitized}`

    const sql = `
      CREATE TABLE IF NOT EXISTS public."${tableName}" (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        "Nome" TEXT,
        "Número" TEXT,
        "E-mail" TEXT,
        "Cidade" TEXT,
        "Campanha" TEXT,
        "Conjunto" TEXT,
        "Anúncio" TEXT,
        source_id TEXT,
        cta_clid TEXT,
        thumbnail TEXT,
        cta TEXT,
        url TEXT,
        source_url TEXT,
        mensagem TEXT,
        status TEXT DEFAULT 'Entrou em contato',
        data_criacao TEXT,
        "Tracking" TEXT
      );

      CREATE INDEX IF NOT EXISTS "idx_rastreamento_${sanitized}_numero"
        ON public."${tableName}" ("Número");

      ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = '${tableName}' AND policyname = 'Admin acessa rastreamento ${sanitized}'
        ) THEN
          CREATE POLICY "Admin acessa rastreamento ${sanitized}"
            ON public."${tableName}" FOR ALL
            USING (auth.jwt() ->> 'user_role' = 'admin');
        END IF;
      END
      $$;
    `

    await this.executeSQL(sql)
  }

  async dropTrackingTable(slug: string): Promise<void> {
    const sanitized = Slug.sanitize(slug)
    const tableName = `Rastreamento_${sanitized}`
    await this.executeSQL(`DROP TABLE IF EXISTS public."${tableName}" CASCADE;`)
  }

  async executeSQL(query: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase.rpc('exec_sql', { query })

    if (error) {
      throw new TableCreationError(`Falha ao executar SQL: ${error.message}`)
    }
  }
}
