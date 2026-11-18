import { ListingEdit } from '../../../_components/listing-pages'
import type { SearchParams } from '../../../_components/ui'

export const metadata = { title: 'Edit property' }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const { id } = await params
  return <ListingEdit kind="property" id={id} searchParams={searchParams} />
}
