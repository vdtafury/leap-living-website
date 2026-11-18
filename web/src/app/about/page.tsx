import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'
import { AboutView } from '@/components/about/about-view'
import { getPublishedContent } from '@/modules/content'
import { listVisibleDevelopers } from '@/modules/developers'

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPublishedContent('about')
  return pageMetadata({ title: seo.title, description: seo.description, path: '/about' })
}

export default async function AboutPage() {
  const [content, developers] = await Promise.all([
    getPublishedContent('about'),
    listVisibleDevelopers(),
  ])
  return <AboutView content={content} developers={developers} />
}
