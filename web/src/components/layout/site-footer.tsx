import { getPublishedContent } from '@/modules/content'
import { SiteFooterView } from './site-footer-view'

/** Site footer with the published settings (Admin → Site settings). */
export async function SiteFooter() {
  return <SiteFooterView settings={await getPublishedContent('settings')} />
}
