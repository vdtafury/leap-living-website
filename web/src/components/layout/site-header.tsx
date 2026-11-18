import { getPublishedContent } from '@/modules/content'
import { SiteHeaderClient } from './site-header-client'

/** Site header with the menu from the published settings (Admin → Site settings). */
export async function SiteHeader() {
  const settings = await getPublishedContent('settings')
  return <SiteHeaderClient links={settings.navigation.links} />
}
