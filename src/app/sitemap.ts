import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ideasbysuyash.in';

  // Base static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Add all published Projects to Sitemap
      const { data: projects } = await supabase
        .from('projects')
        .select('slug, id, updated_at, created_at')
        .eq('is_published', true);

      if (projects && projects.length > 0) {
        projects.forEach((project) => {
          const slugOrId = (project.slug && !project.slug.startsWith('http') && !project.slug.includes('/'))
            ? project.slug
            : project.id;

          routes.push({
            url: `${baseUrl}/projects/${slugOrId}`,
            lastModified: new Date(project.updated_at || project.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      }

      // Add all published Articles to Sitemap
      const { data: articles } = await supabase
        .from('articles')
        .select('slug, id, updated_at, created_at')
        .eq('is_published', true);

      if (articles && articles.length > 0) {
        articles.forEach((article) => {
          const slugOrId = (article.slug && !article.slug.startsWith('http') && !article.slug.includes('/'))
            ? article.slug
            : article.id;

          routes.push({
            url: `${baseUrl}/articles/${slugOrId}`,
            lastModified: new Date(article.updated_at || article.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      }
    }
  } catch (err) {
    console.error('Error generating sitemap entries from Supabase:', err);
  }

  return routes;
}
