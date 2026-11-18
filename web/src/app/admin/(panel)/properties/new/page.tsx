import { ListingEdit } from '../../../_components/listing-pages'
import type { SearchParams } from '../../../_components/ui'

export const metadata = { title: 'New property' }

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <ListingEdit kind="property" id={null} searchParams={searchParams} />
}
