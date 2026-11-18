import {
  AVAILABILITY,
  COMPLETION_STATUSES,
  parseJsonArray,
  PROJECT_STAGE_SUGGESTIONS,
  PROPERTY_TYPES,
  type ListingImage,
} from '@/modules/listings'
import type { FormSection } from '../_components/listing-form'

const opts = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }))

export const PROPERTY_SECTIONS: FormSection[] = [
  {
    title: 'Listing',
    fields: [
      { name: 'title', label: 'Title', required: true, max: 140, wide: true },
      { name: 'subtitle', label: 'Subtitle', max: 200, wide: true },
      {
        name: 'referenceNumber',
        label: 'Reference',
        required: true,
        max: 30,
        help: 'e.g. LL-BUY-150',
      },
      {
        name: 'slug',
        label: 'URL slug',
        max: 120,
        help: 'Leave empty to make one from the title.',
      },
      {
        name: 'transactionType',
        label: 'For',
        type: 'select',
        options: [
          { value: 'BUY', label: 'Sale (Buy page)' },
          { value: 'RENT', label: 'Rent (Rent page)' },
        ],
      },
      {
        name: 'segment',
        label: 'Segment',
        type: 'select',
        options: [
          { value: 'RESIDENTIAL', label: 'Residential' },
          { value: 'COMMERCIAL', label: 'Commercial' },
        ],
      },
      {
        name: 'propertyType',
        label: 'Property type',
        type: 'select',
        options: opts(PROPERTY_TYPES),
      },
      {
        name: 'completionStatus',
        label: 'Completion',
        type: 'select',
        options: opts(COMPLETION_STATUSES),
      },
    ],
  },
  {
    title: 'Location, price and size',
    fields: [
      { name: 'community', label: 'Community', required: true, max: 80 },
      { name: 'emirate', label: 'Emirate', max: 40 },
      { name: 'developer', label: 'Developer', max: 80 },
      {
        name: 'price',
        label: 'Price (AED)',
        type: 'money',
        required: true,
        help: 'Numbers only, e.g. 4500000',
      },
      {
        name: 'priceFrequency',
        label: 'Price suffix',
        max: 20,
        help: 'For rentals, e.g. “/ year”.',
      },
      { name: 'beds', label: 'Bedrooms', type: 'number', help: '0 for offices / studios' },
      { name: 'baths', label: 'Bathrooms', type: 'number' },
      { name: 'area', label: 'Built-up area (sq ft)', type: 'money', required: true },
      {
        name: 'permitNumber',
        label: 'Permit number',
        max: 40,
        help: 'Advertising permit, when issued.',
      },
    ],
  },
  {
    title: 'On the website',
    help: '“Availability” is the commercial state; it never hides a listing. Only Publish / Unpublish does.',
    fields: [
      {
        name: 'availabilityStatus',
        label: 'Availability',
        type: 'select',
        options: Object.entries(AVAILABILITY).map(([value, label]) => ({ value, label })),
      },
      {
        name: 'highlightLabel',
        label: 'Card label',
        max: 40,
        help: 'e.g. Private Advisory, Ready-to-Move. Shown while available.',
      },
      { name: 'sortOrder', label: 'Order', type: 'number', help: 'Lower numbers come first.' },
      {
        name: 'featured',
        label: 'Featured on the homepage (sale listings)',
        type: 'checkbox',
        wide: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        max: 5000,
        wide: true,
        rows: 6,
      },
      {
        name: 'highlights',
        label: 'Highlights',
        type: 'textarea',
        wide: true,
        help: 'One per line (up to 20).',
      },
    ],
  },
]

export const PROJECT_SECTIONS: FormSection[] = [
  {
    title: 'Project',
    fields: [
      { name: 'title', label: 'Title', required: true, max: 140, wide: true },
      {
        name: 'referenceNumber',
        label: 'Reference',
        required: true,
        max: 30,
        help: 'e.g. LL-PRJ-04',
      },
      {
        name: 'slug',
        label: 'URL slug',
        max: 120,
        help: 'Leave empty to make one from the title.',
      },
      { name: 'developer', label: 'Developer', max: 80 },
      { name: 'community', label: 'Community', required: true, max: 80 },
      {
        name: 'segment',
        label: 'Segment',
        type: 'select',
        options: [
          { value: 'RESIDENTIAL', label: 'Residential' },
          { value: 'COMMERCIAL', label: 'Commercial' },
          { value: 'MIXED-USE', label: 'Mixed-use' },
        ],
      },
      {
        name: 'status',
        label: 'Delivery stage',
        required: true,
        max: 40,
        list: [...PROJECT_STAGE_SUGGESTIONS],
        help: 'Shown on the card, e.g. Off-Plan.',
      },
    ],
  },
  {
    title: 'Commercial terms',
    fields: [
      { name: 'startingPrice', label: 'Starting price (AED)', type: 'money', required: true },
      { name: 'handoverLabel', label: 'Handover', max: 40, help: 'e.g. Q4 2028' },
      { name: 'paymentPlan', label: 'Payment plan', max: 120 },
      { name: 'unitTypes', label: 'Unit types', max: 160, wide: true },
    ],
  },
  {
    title: 'On the website',
    fields: [
      { name: 'sortOrder', label: 'Order', type: 'number', help: 'Lower numbers come first.' },
      { name: 'featured', label: 'Featured on the homepage', type: 'checkbox', wide: true },
      { name: 'overview', label: 'Overview', type: 'textarea', max: 5000, wide: true, rows: 6 },
      {
        name: 'keyFacts',
        label: 'Key facts',
        type: 'textarea',
        wide: true,
        help: 'One per line as “Label: Value”, e.g. “Target Handover: Q4 2028”.',
      },
      {
        name: 'amenities',
        label: 'Amenities',
        type: 'textarea',
        wide: true,
        help: 'One per line.',
      },
    ],
  },
]

type Row = Record<string, unknown> & { images: string }

/** Database row -> form values (decimals and JSON lists as editable text). */
export function formValues(row: Row | null, kind: 'property' | 'project') {
  if (!row) {
    return {
      values:
        kind === 'property'
          ? {
              transactionType: 'BUY',
              segment: 'RESIDENTIAL',
              propertyType: 'Villa',
              completionStatus: 'Ready',
              availabilityStatus: 'AVAILABLE',
              emirate: 'Dubai',
              sortOrder: '100',
              beds: '0',
              baths: '0',
            }
          : { segment: 'RESIDENTIAL', sortOrder: '100', featured: true },
      images: [] as ListingImage[],
    }
  }
  const values: Record<string, string | boolean> = {}
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === 'boolean') values[key] = value
    else if (value !== null && value !== undefined && !(value instanceof Date))
      values[key] = String(value)
  }
  if (kind === 'property')
    values.highlights = parseJsonArray<string>(row.highlights as string).join('\n')
  if (kind === 'project') {
    values.amenities = parseJsonArray<string>(row.amenities as string).join('\n')
    values.keyFacts = parseJsonArray<{ label: string; value: string }>(row.keyFacts as string)
      .map((f) => `${f.label}: ${f.value}`)
      .join('\n')
  }
  return { values, images: parseJsonArray<ListingImage>(row.images) }
}
