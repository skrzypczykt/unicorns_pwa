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
type AssociationNews = Database['public']['Tables']['association_news']['Row']
type AssociationNewsInsert = Database['public']['Tables']['association_news']['Insert']
type AssociationNewsUpdate = Database['public']['Tables']['association_news']['Update']

type AssociationDocument = Database['public']['Tables']['association_documents']['Row']
type AssociationDocumentInsert = Database['public']['Tables']['association_documents']['Insert']
type AssociationDocumentUpdate = Database['public']['Tables']['association_documents']['Update']

type AssociationPoll = Database['public']['Tables']['association_polls']['Row']
type AssociationPollInsert = Database['public']['Tables']['association_polls']['Insert']
type AssociationPollUpdate = Database['public']['Tables']['association_polls']['Update']

type AssociationPollOption = Database['public']['Tables']['association_poll_options']['Row']
type AssociationPollOptionInsert = Database['public']['Tables']['association_poll_options']['Insert']
type AssociationPollOptionUpdate = Database['public']['Tables']['association_poll_options']['Update']

type AssociationPollVote = Database['public']['Tables']['association_poll_votes']['Row']
type AssociationPollVoteInsert = Database['public']['Tables']['association_poll_votes']['Insert']

export type {
  AssociationNews,
  AssociationNewsInsert,
  AssociationNewsUpdate,
  AssociationDocument,
  AssociationDocumentInsert,
  AssociationDocumentUpdate,
  AssociationPoll,
  AssociationPollInsert,
  AssociationPollUpdate,
  AssociationPollOption,
  AssociationPollOptionInsert,
  AssociationPollOptionUpdate,
  AssociationPollVote,
  AssociationPollVoteInsert,
}

/**
 * Document category type
 */
export type DocumentCategory = AssociationDocument['category']

/**
 * Poll type
 */
export type PollType = AssociationPoll['poll_type']

/**
 * Poll with options
 */
export interface PollWithOptions extends AssociationPoll {
  options: AssociationPollOption[]
}

/**
 * Poll result for a single option
 */
export interface PollOptionResult {
  option_id: string
  option_text: string
  vote_count: number
}

/**
 * Poll with voting results
 */
export interface PollWithResults extends AssociationPoll {
  options: PollOptionResult[]
  total_votes: number
}

// ============================================================================
// NEWS OPERATIONS
// ============================================================================

/**
 * Fetch all active news (not expired, ordered by pinned status and date)
 *
 * @returns List of active news items
 */
export async function getActiveNews(): Promise<QueryListResult<AssociationNews>> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('association_news')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })

    if (error) {
      handleQueryError(error, 'fetching active news')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch recent news (limited number for dashboard)
 *
 * @param limit - Number of news items to fetch (default 3)
 * @returns Recent news items
 */
export async function getRecentNews(limit = 3): Promise<QueryListResult<AssociationNews>> {
  try {
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('association_news')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      handleQueryError(error, `fetching recent news (limit ${limit})`)
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch all news (including expired, for admin management)
 *
 * @returns All news items
 */
export async function getAllNews(): Promise<QueryListResult<AssociationNews>> {
  try {
    const { data, error } = await supabase
      .from('association_news')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      handleQueryError(error, 'fetching all news')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Create news item
 *
 * @param newsData - News data to insert
 * @returns Created news item
 */
export async function createNews(
  newsData: AssociationNewsInsert
): Promise<QueryResult<AssociationNews>> {
  try {
    const { data, error } = await supabase
      .from('association_news')
      .insert(newsData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating news')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update news item
 *
 * @param id - News ID
 * @param updates - Fields to update
 * @returns Updated news item
 */
export async function updateNews(
  id: string,
  updates: AssociationNewsUpdate
): Promise<QueryResult<AssociationNews>> {
  try {
    const { data, error } = await supabase
      .from('association_news')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating news ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete news item
 *
 * @param id - News ID
 * @returns Success/error result
 */
export async function deleteNews(id: string): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase.from('association_news').delete().eq('id', id)

    if (error) {
      handleQueryError(error, `deleting news ${id}`)
      return errorResult(error)
    }

    return successResult(undefined as void)
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// DOCUMENT OPERATIONS
// ============================================================================

/**
 * Fetch all documents
 *
 * @param category - Optional category filter
 * @returns List of documents
 */
export async function getDocuments(
  category?: DocumentCategory
): Promise<QueryListResult<AssociationDocument>> {
  try {
    let query = supabase
      .from('association_documents')
      .select('*')
      .order('upload_date', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      handleQueryError(error, category ? `fetching ${category} documents` : 'fetching all documents')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Create document
 *
 * @param documentData - Document data to insert
 * @returns Created document
 */
export async function createDocument(
  documentData: AssociationDocumentInsert
): Promise<QueryResult<AssociationDocument>> {
  try {
    const { data, error } = await supabase
      .from('association_documents')
      .insert(documentData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating document')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update document
 *
 * @param id - Document ID
 * @param updates - Fields to update
 * @returns Updated document
 */
export async function updateDocument(
  id: string,
  updates: AssociationDocumentUpdate
): Promise<QueryResult<AssociationDocument>> {
  try {
    const { data, error } = await supabase
      .from('association_documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating document ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete document
 *
 * @param id - Document ID
 * @returns Success/error result
 */
export async function deleteDocument(id: string): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase.from('association_documents').delete().eq('id', id)

    if (error) {
      handleQueryError(error, `deleting document ${id}`)
      return errorResult(error)
    }

    return successResult(undefined as void)
  } catch (error) {
    return errorResult(error as any)
  }
}

// ============================================================================
// POLL OPERATIONS
// ============================================================================

/**
 * Fetch all polls
 *
 * @param activeOnly - If true, only fetch active polls (default false)
 * @returns List of polls
 */
export async function getPolls(activeOnly = false): Promise<QueryListResult<AssociationPoll>> {
  try {
    let query = supabase
      .from('association_polls')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      handleQueryError(error, activeOnly ? 'fetching active polls' : 'fetching all polls')
      return errorListResult(error)
    }

    return successListResult(data || [])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Fetch poll by ID with options
 *
 * @param id - Poll ID
 * @returns Poll with options
 */
export async function getPollWithOptions(id: string): Promise<QueryResult<PollWithOptions>> {
  try {
    const { data, error } = await supabase
      .from('association_polls')
      .select(
        `
        *,
        options:association_poll_options (
          *
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      handleQueryError(error, `fetching poll ${id} with options`)
      return errorResult(error)
    }

    return successResult(data as PollWithOptions)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Fetch all polls with options
 *
 * @param activeOnly - If true, only fetch active polls
 * @returns Polls with options
 */
export async function getPollsWithOptions(
  activeOnly = false
): Promise<QueryListResult<PollWithOptions>> {
  try {
    let query = supabase
      .from('association_polls')
      .select(
        `
        *,
        options:association_poll_options (
          *
        )
      `
      )
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      handleQueryError(error, activeOnly ? 'fetching active polls with options' : 'fetching all polls with options')
      return errorListResult(error)
    }

    return successListResult((data || []) as PollWithOptions[])
  } catch (error) {
    return errorListResult(error as any)
  }
}

/**
 * Get poll results using RPC function
 *
 * @param pollId - Poll ID
 * @returns Poll with voting results
 */
export async function getPollResults(pollId: string): Promise<QueryResult<PollWithResults>> {
  try {
    const { data, error } = await supabase.rpc('get_poll_results', { poll_id: pollId })

    if (error) {
      handleQueryError(error, `fetching results for poll ${pollId}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Check if user has voted on a poll
 *
 * @param pollId - Poll ID
 * @param userId - User ID
 * @returns Vote record if exists, null otherwise
 */
export async function getUserPollVote(
  pollId: string,
  userId: string
): Promise<QueryResult<AssociationPollVote>> {
  try {
    const { data, error } = await supabase
      .from('association_poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      handleQueryError(error, `checking vote for poll ${pollId} user ${userId}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Create poll
 *
 * @param pollData - Poll data to insert
 * @returns Created poll
 */
export async function createPoll(
  pollData: AssociationPollInsert
): Promise<QueryResult<AssociationPoll>> {
  try {
    const { data, error } = await supabase
      .from('association_polls')
      .insert(pollData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating poll')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Create poll option
 *
 * @param optionData - Option data to insert
 * @returns Created option
 */
export async function createPollOption(
  optionData: AssociationPollOptionInsert
): Promise<QueryResult<AssociationPollOption>> {
  try {
    const { data, error } = await supabase
      .from('association_poll_options')
      .insert(optionData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, 'creating poll option')
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Update poll
 *
 * @param id - Poll ID
 * @param updates - Fields to update
 * @returns Updated poll
 */
export async function updatePoll(
  id: string,
  updates: AssociationPollUpdate
): Promise<QueryResult<AssociationPoll>> {
  try {
    const { data, error } = await supabase
      .from('association_polls')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `updating poll ${id}`)
      return errorResult(error)
    }

    return successResult(data)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Delete poll (and its options/votes via cascade)
 *
 * @param id - Poll ID
 * @returns Success/error result
 */
export async function deletePoll(id: string): Promise<QueryResult<void>> {
  try {
    const { error } = await supabase.from('association_polls').delete().eq('id', id)

    if (error) {
      handleQueryError(error, `deleting poll ${id}`)
      return errorResult(error)
    }

    return successResult(undefined as void)
  } catch (error) {
    return errorResult(error as any)
  }
}

/**
 * Cast vote on a poll
 *
 * @param voteData - Vote data to insert
 * @returns Created vote
 */
export async function castVote(
  voteData: AssociationPollVoteInsert
): Promise<QueryResult<AssociationPollVote>> {
  try {
    const { data, error } = await supabase
      .from('association_poll_votes')
      .insert(voteData)
      .select()
      .single()

    if (error) {
      handleQueryError(error, `casting vote on poll ${voteData.poll_id}`)
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
 * Create poll with options atomically
 *
 * @param pollData - Poll data
 * @param options - Array of option texts
 * @returns Created poll with options
 */
export async function createPollWithOptions(
  pollData: AssociationPollInsert,
  options: string[]
): Promise<QueryResult<PollWithOptions>> {
  try {
    // 1. Create poll
    const pollResult = await createPoll(pollData)
    if (pollResult.error || !pollResult.data) {
      return errorResult(pollResult.error!)
    }

    const poll = pollResult.data

    // 2. Create options
    const optionResults: AssociationPollOption[] = []
    for (let i = 0; i < options.length; i++) {
      const optionResult = await createPollOption({
        poll_id: poll.id,
        option_text: options[i],
        display_order: i,
      })

      if (optionResult.error) {
        handleQueryError(optionResult.error, `creating option ${i} for poll ${poll.id}`)
        continue
      }

      if (optionResult.data) {
        optionResults.push(optionResult.data)
      }
    }

    return successResult({
      ...poll,
      options: optionResults,
    })
  } catch (error) {
    return errorResult(error as any)
  }
}
