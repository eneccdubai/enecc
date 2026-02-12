/**
 * @deprecated Este archivo está deprecated.
 *
 * Usa los nuevos repositorios en su lugar:
 * - import { PropertiesRepository } from '../repositories'
 *
 * Este archivo se mantiene temporalmente para compatibilidad hacia atrás.
 */

import { PropertiesRepository } from '../repositories'
import { supabase } from '../supabase/config'

// ==================== PROPERTIES ====================

/**
 * @deprecated Usa PropertiesRepository.getAll() en su lugar
 */
export const getLocalProperties = async () => {
  console.warn('[DEPRECATED] getLocalProperties() - Use PropertiesRepository.getAll() instead')
  return await PropertiesRepository.getAll()
}

/**
 * @deprecated Usa PropertiesRepository.create() en su lugar
 */
export const addLocalProperty = async (property) => {
  console.warn('[DEPRECATED] addLocalProperty() - Use PropertiesRepository.create() instead')
  return await PropertiesRepository.create(property)
}

/**
 * @deprecated Usa PropertiesRepository.update() en su lugar
 */
export const updateLocalProperty = async (id, updates) => {
  console.warn('[DEPRECATED] updateLocalProperty() - Use PropertiesRepository.update() instead')
  return await PropertiesRepository.update(id, updates)
}

/**
 * @deprecated Usa PropertiesRepository.delete() en su lugar
 */
export const deleteLocalProperty = async (id) => {
  console.warn('[DEPRECATED] deleteLocalProperty() - Use PropertiesRepository.delete() instead')
  return await PropertiesRepository.delete(id)
}

/**
 * @deprecated Usa PropertiesRepository.toggleAvailability() en su lugar
 */
export const toggleLocalPropertyAvailability = async (id) => {
  console.warn('[DEPRECATED] toggleLocalPropertyAvailability() - Use PropertiesRepository.toggleAvailability() instead')
  return await PropertiesRepository.toggleAvailability(id)
}

// ==================== USERS ====================

/**
 * @deprecated Consulta directamente a Supabase
 */
export const getLocalUsers = async () => {
  console.warn('[DEPRECATED] getLocalUsers() - Query Supabase users table directly')
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * @deprecated Elimina directamente de Supabase
 */
export const deleteLocalUser = async (userId) => {
  console.warn('[DEPRECATED] deleteLocalUser() - Delete from Supabase users table directly')
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw error
  return true
}
