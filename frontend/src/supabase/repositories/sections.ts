import { supabase } from '../client'
import type { Database } from '../../types/database.types'
import {
  QueryResult,
  QueryListResult,
  handleQueryError,
  successResult,
  successListResult,
  errorResult,
  errorListResult,
} from './base'

// Types from database
type ActivityType = Database['public']['Tables']['activity_types']['Row']
type ActivityTypeInsert = Database['public']['Tables']['activity_types']['Insert']
type ActivityTypeUpdate = Database['public']['Tables']['activity_types']['Update']

// Alias for domain clarity (sections = activity types)
export type Section = ActivityType
export type SectionInsert = ActivityTypeInsert
export type SectionUpdate = ActivityTypeUpdate

/**
 * Section with default trainer information
 */
export interface SectionWithTrainer extends Section {
  default_trainer?: {
    id: string
    display_name: string
    email: string
  } | null
}

/**
 * Section for dropdown/list display
 */
export interface SectionListItem {
  id: string
  name: string
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Fetch all sections (activity types)
 * Returns minimal data for dropdowns and filters
 *
 * @returns List of sections (id, name only)
 */
export async function getSections(): Promise<QueryListResult<SectionListItem>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching sections')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all sections with full details
 * Used when complete section data is needed
 *
 * @returns List of sections with all fields
 */
export async function getAllSections(): Promise<QueryListResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching all sections')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch sections with default trainer information
 * Used in admin section management
 *
 * @returns Sections with trainer details
 */
export async function getSectionsWithTrainer(): Promise<QueryListResult<SectionWithTrainer>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select(
        `
        *,
        default_trainer:users!activity_types_default_trainer_id_fkey (
          id,
          display_name,
          email
        )
      `
      )
      .order('name', { ascending: true })

    if (error) {
      handleQueryError(error, 'fetching sections with trainers')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch section by ID
 *
 * @param id - Section ID
 * @returns Section record
 */
export async function getSectionById(id: string): Promise<QueryResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching section ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch section by ID with trainer information
 *
 * @param id - Section ID
 * @returns Section with trainer details
 */
export async function getSectionWithTrainerById(id: string): Promise<QueryResult<SectionWithTrainer>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .select(
        `
        *,
        default_trainer:users!activity_types_default_trainer_id_fkey (
          id,
          display_name,
          email
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching section ${id} with trainer`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new section
 *
 * @param sectionData - Section data to insert
 * @returns Created section
 */
export async function createSection(sectionData: SectionInsert): Promise<QueryResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .insert(sectionData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating section')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update section details
 *
 * @param id - Section ID
 * @param updates - Fields to update
 * @returns Updated section
 */
export async function updateSection(
  id: string,
  updates: SectionUpdate
): Promise<QueryResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating section ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete section
 * Note: This may fail if section has associated activities
 *
 * @param id - Section ID
 * @returns Success/error result
 */
export async function deleteSection(id: string): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase.from('activity_types').delete().eq('id', id)

    if (error) {
      handleQueryError(error, `deleting section ${id}`)
      return errorResult(error)
    }

    return successResult(undefined as void)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update section's WhatsApp group URL
 *
 * @param id - Section ID
 * @param whatsappUrl - WhatsApp group URL
 * @returns Updated section
 */
export async function updateSectionWhatsApp(
  id: string,
  whatsappUrl: string | null
): Promise<QueryResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .update({ whatsapp_group_url: whatsappUrl })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating WhatsApp URL for section ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update section's default trainer
 *
 * @param id - Section ID
 * @param trainerId - Trainer user ID
 * @returns Updated section
 */
export async function updateSectionDefaultTrainer(
  id: string,
  trainerId: string | null
): Promise<QueryResult<Section>> {
  try {
    const { data, error } = await supabase
      .from('activity_types')
      .update({ default_trainer_id: trainerId })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating default trainer for section ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}
