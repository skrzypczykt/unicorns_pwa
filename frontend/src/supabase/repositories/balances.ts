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
type BalanceTransaction = Database['public']['Tables']['balance_transactions']['Row']
type BalanceTransactionInsert = Database['public']['Tables']['balance_transactions']['Insert']
type UserSectionBalance = Database['public']['Tables']['user_section_balances']['Row']
type UserSectionBalanceInsert = Database['public']['Tables']['user_section_balances']['Insert']
type UserSectionBalanceUpdate = Database['public']['Tables']['user_section_balances']['Update']

export type {
  BalanceTransaction,
  BalanceTransactionInsert,
  UserSectionBalance,
  UserSectionBalanceInsert,
  UserSectionBalanceUpdate,
}

/**
 * Transaction type
 */
export type TransactionType = BalanceTransaction['type']

/**
 * Transaction filters for queries
 */
export interface TransactionFilters {
  activityTypeId?: string
  type?: TransactionType
  startDate?: string
  endDate?: string
  limit?: number
}

/**
 * Balance with transaction details
 */
export interface BalanceWithTransactions {
  balance: UserSectionBalance | null
  transactions: BalanceTransaction[]
}

// ============================================================================
// READ OPERATIONS - BALANCES
// ============================================================================

/**
 * Fetch user balance for a specific activity type (section)
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID
 * @returns User's balance for this section
 */
export async function getUserBalance(
  userId: string,
  activityTypeId: string
): Promise<QueryResult<UserSectionBalance>> {
  try {
    const { data, error } = await supabase
      .from('user_section_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type_id', activityTypeId)
      .maybeSingle()

    if (error) {
      handleQueryError(error, `fetching balance for user ${userId} section ${activityTypeId}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch all balances for a user (across all activity types)
 *
 * @param userId - User ID
 * @returns List of user's balances
 */
export async function getUserBalances(
  userId: string
): Promise<QueryListResult<UserSectionBalance>> {
  try {
    const { data, error } = await supabase
      .from('user_section_balances')
      .select('*')
      .eq('user_id', userId)
      .order('activity_type_id', { ascending: true })

    if (error) {
      handleQueryError(error, `fetching all balances for user ${userId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch balances for multiple users in a section
 * Used by trainers to see participant balances
 *
 * @param userIds - Array of user IDs
 * @param activityTypeId - Activity type ID
 * @returns Balances for all specified users
 */
export async function getBalancesForUsers(
  userIds: string[],
  activityTypeId: string
): Promise<QueryListResult<UserSectionBalance>> {
  try {
    const { data, error } = await supabase
      .from('user_section_balances')
      .select('*')
      .eq('activity_type_id', activityTypeId)
      .in('user_id', userIds)

    if (error) {
      handleQueryError(error, `fetching balances for ${userIds.length} users in section ${activityTypeId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

// ============================================================================
// READ OPERATIONS - TRANSACTIONS
// ============================================================================

/**
 * Fetch transaction history for a user
 *
 * @param userId - User ID
 * @param filters - Optional filters (activity type, transaction type, date range, limit)
 * @returns User's transaction history
 */
export async function getUserTransactions(
  userId: string,
  filters?: TransactionFilters
): Promise<QueryListResult<BalanceTransaction>> {
  try {
    let query = supabase
      .from('balance_transactions')
      .select('*')
      .eq('user_id', userId)

    // Apply filters
    if (filters?.activityTypeId) {
      query = query.eq('activity_type_id', filters.activityTypeId)
    }
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    // Order by newest first
    query = query.order('created_at', { ascending: false })

    // Apply limit (default 50)
    const limit = filters?.limit || 50
    query = query.limit(limit)

    const { data, error } = await query

    if (error) {
      handleQueryError(error, `fetching transactions for user ${userId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all transactions for data export (no limit)
 *
 * @param userId - User ID
 * @returns All user transactions
 */
export async function getAllUserTransactions(
  userId: string
): Promise<QueryListResult<BalanceTransaction>> {
  try {
    const { data, error } = await supabase
      .from('balance_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      handleQueryError(error, `fetching all transactions for user ${userId}`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch balance with transaction history
 * Combined query for displaying balance + history together
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID
 * @param transactionLimit - Max transactions to fetch (default 50)
 * @returns Balance and transactions
 */
export async function getBalanceWithTransactions(
  userId: string,
  activityTypeId: string,
  transactionLimit = 50
): Promise<QueryResult<BalanceWithTransactions>> {
  try {
    // Fetch balance and transactions in parallel
    const [balanceResult, transactionsResult] = await Promise.all([
      getUserBalance(userId, activityTypeId),
      getUserTransactions(userId, { activityTypeId, limit: transactionLimit }),
    ])

    if (balanceResult.error || transactionsResult.error) {
      const error = balanceResult.error || transactionsResult.error
      return errorResult(error!)
    }

    return successResult({
      balance: balanceResult.data,
      transactions: transactionsResult.data || [],
    })
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new transaction record
 * Transactions are immutable once created
 *
 * @param transactionData - Transaction data to insert
 * @returns Created transaction
 */
export async function createTransaction(
  transactionData: BalanceTransactionInsert
): Promise<QueryResult<BalanceTransaction>> {
  try {
    const { data, error } = await supabase
      .from('balance_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating transaction')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update or insert user balance
 * Creates new balance record if one doesn't exist
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID
 * @param newBalance - New balance value
 * @returns Updated or created balance
 */
export async function upsertUserBalance(
  userId: string,
  activityTypeId: string,
  newBalance: number
): Promise<QueryResult<UserSectionBalance>> {
  try {
    const balanceData: UserSectionBalanceInsert = {
      user_id: userId,
      activity_type_id: activityTypeId,
      balance: newBalance,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('user_section_balances')
      .upsert(balanceData, {
        onConflict: 'user_id,activity_type_id',
      })
      .select()
      .single()

    if (error) {
      handleQueryError(error, `upserting balance for user ${userId} section ${activityTypeId}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// COMPLEX OPERATIONS
// ============================================================================

/**
 * Process a balance transaction atomically
 * Fetches current balance, creates transaction record, updates balance
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID
 * @param amount - Transaction amount (positive for credit, negative for debit)
 * @param type - Transaction type
 * @param description - Transaction description
 * @param referenceId - Optional reference ID (e.g., activity_id, registration_id)
 * @param createdBy - Optional admin/trainer user ID who created the transaction
 * @returns Created transaction and updated balance
 */
export async function processTransaction(
  userId: string,
  activityTypeId: string,
  amount: number,
  type: TransactionType,
  description: string,
  referenceId?: string | null,
  createdBy?: string | null
): Promise<QueryResult<{ transaction: BalanceTransaction; balance: UserSectionBalance }>> {
  try {
    // 1. Get current balance
    const balanceResult = await getUserBalance(userId, activityTypeId)
    if (balanceResult.error) {
      return errorResult(balanceResult.error)
    }

    const currentBalance = balanceResult.data?.balance || 0
    const newBalance = currentBalance + amount

    // 2. Create transaction record
    const transactionData: BalanceTransactionInsert = {
      user_id: userId,
      activity_type_id: activityTypeId,
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      type,
      description,
      reference_id: referenceId,
      created_by: createdBy,
    }

    const transactionResult = await createTransaction(transactionData)
    if (transactionResult.error) {
      return errorResult(transactionResult.error)
    }

    // 3. Update balance
    const balanceUpdateResult = await upsertUserBalance(userId, activityTypeId, newBalance)
    if (balanceUpdateResult.error) {
      return errorResult(balanceUpdateResult.error)
    }

    return successResult({
      transaction: transactionResult.data!,
      balance: balanceUpdateResult.data!,
    })
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Charge membership fee to user
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID (membership section)
 * @param amount - Fee amount (negative number)
 * @param description - Fee description
 * @param createdBy - Admin user ID who charged the fee
 * @returns Transaction and updated balance
 */
export async function chargeMembershipFee(
  userId: string,
  activityTypeId: string,
  amount: number,
  description: string,
  createdBy: string
): Promise<QueryResult<{ transaction: BalanceTransaction; balance: UserSectionBalance }>> {
  return processTransaction(
    userId,
    activityTypeId,
    -Math.abs(amount), // Ensure negative
    'membership_fee_charge',
    description,
    null,
    createdBy
  )
}

/**
 * Process membership fee payment
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID (membership section)
 * @param amount - Payment amount (positive number)
 * @param description - Payment description
 * @param createdBy - Admin user ID who processed the payment
 * @returns Transaction and updated balance
 */
export async function processMembershipPayment(
  userId: string,
  activityTypeId: string,
  amount: number,
  description: string,
  createdBy: string
): Promise<QueryResult<{ transaction: BalanceTransaction; balance: UserSectionBalance }>> {
  return processTransaction(
    userId,
    activityTypeId,
    Math.abs(amount), // Ensure positive
    'membership_fee_payment',
    description,
    null,
    createdBy
  )
}

/**
 * Deduct class cost from user balance
 * Used when marking attendance
 *
 * @param userId - User ID
 * @param activityTypeId - Activity type ID
 * @param activityId - Activity (class) ID
 * @param cost - Class cost (positive number)
 * @param description - Transaction description
 * @returns Transaction and updated balance
 */
export async function deductClassCost(
  userId: string,
  activityTypeId: string,
  activityId: string,
  cost: number,
  description: string
): Promise<QueryResult<{ transaction: BalanceTransaction; balance: UserSectionBalance }>> {
  return processTransaction(
    userId,
    activityTypeId,
    -Math.abs(cost), // Ensure negative
    'class_payment',
    description,
    activityId,
    null
  )
}

/**
 * Bulk charge membership fees to multiple users
 *
 * @param charges - Array of charge operations
 * @returns Results for each charge
 */
export async function bulkChargeMembershipFees(
  charges: Array<{
    userId: string
    activityTypeId: string
    amount: number
    description: string
    createdBy: string
  }>
): Promise<QueryListResult<{ transaction: BalanceTransaction; balance: UserSectionBalance }>> {
  try {
    const results: Array<{ transaction: BalanceTransaction; balance: UserSectionBalance }> = []

    // Process charges sequentially to avoid race conditions
    for (const charge of charges) {
      const result = await chargeMembershipFee(
        charge.userId,
        charge.activityTypeId,
        charge.amount,
        charge.description,
        charge.createdBy
      )

      if (result.error) {
        handleQueryError(result.error, `bulk charging user ${charge.userId}`)
        continue
      }

      if (result.data) {
        results.push(result.data)
      }
    }

    return successListResult(results)
  } catch (error) {
    return errorListResult(error as any)
  }
}
