/**
 * Data Access Layer - Repository Pattern
 *
 * Centralized database queries for all domains.
 * Import from this file to use repository functions.
 *
 * Example:
 * ```typescript
 * import { getActivitiesInWeek, createActivity } from '@/supabase/repositories'
 *
 * const result = await getActivitiesInWeek(startDate, endDate)
 * if (result.error) {
 *   // Handle error
 * } else {
 *   // Use result.data
 * }
 * ```
 */

// Base types and utilities
export * from './base'

// Domain repositories
export * from './activities'
export * from './registrations'
export * from './users'
export * from './balances'
export * from './sections'
export * from './association'
