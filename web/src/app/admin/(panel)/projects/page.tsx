import { ListingIndex } from '../../_components/listing-pages'
import type { SearchParams } from '../../_components/ui'

export const metadata = { title: 'Projects' }

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <ListingIndex kind="project" searchParams={searchParams} />
}
