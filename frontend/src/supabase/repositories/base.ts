import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Standard result type for single-record queries
 */
export interface QueryResult<T> {
  data: T | null
  error: PostgrestError | null
}

/**
 * Standard result type for multi-record queries
 */
export interface QueryListResult<T> {
  data: T[]
  error: PostgrestError | null
}

/**
 * Helper function for consistent error handling across repositories
 * Only logs errors in development mode to avoid exposing sensitive data
 *
 * @param error - PostgrestError from Supabase query
 * @param context - Description of the operation (e.g., "fetching activities")
 */
export function handleQueryError(error: PostgrestError | null, context: string): void {
  if (error && import.meta.env.DEV) {
    console.error(`[DB Error - ${context}]:`, error)
  }
}

/**
 * Helper to create a successful query result
 */
export function successResult<T>(data: T): QueryResult<T> {
  return { data, error: null }
}

/**
 * Helper to create a successful list query result
 */
export function successListResult<T>(data: T[]): QueryListResult<T> {
  return { data, error: null }
}

/**
 * Helper to create an error query result
 */
export function errorResult<T>(error: PostgrestError): QueryResult<T> {
  return { data: null, error }
}

/**
 * Helper to create an error list query result
 */
export function errorListResult<T>(error: PostgrestError): QueryListResult<T> {
  return { data: [], error }
}
