/**
 * Section ids that links elsewhere on the site point at. Kept out of client components so
 * server pages can use them too (a value exported from a 'use client' file is not a string
 * on the server).
 */

/** The Sell page's briefing form; every "Free Valuation" link goes to `/sell#valuation-form`. */
export const VALUATION_ANCHOR = 'valuation-form'
