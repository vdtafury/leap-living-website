import { ListingIndex } from '../../_components/listing-pages'
import type { SearchParams } from '../../_components/ui'

export const metadata = { title: 'Properties' }

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <ListingIndex kind="property" searchParams={searchParams} />
}
