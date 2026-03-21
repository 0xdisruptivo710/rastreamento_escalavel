import { IConfigRepository } from '@/domain/interfaces/IConfigRepository'
import { createAdminClient } from '../supabase/admin'

export class SupabaseConfigRepository implements IConfigRepository {
  private getClient() {
    return createAdminClient()
  }

  async getValue(key: string): Promise<string | null> {
    const supabase = this.getClient()
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', key)
      .maybeSingle()

    if (error) {
      throw new Error(`Falha ao buscar config "${key}": ${error.message}`)
    }

    return data?.value ?? null
  }

  async setValue(key: string, value: string): Promise<void> {
    const supabase = this.getClient()
    const { error } = await supabase
      .from('config')
      .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) {
      throw new Error(`Falha ao salvar config "${key}": ${error.message}`)
    }
  }
}
