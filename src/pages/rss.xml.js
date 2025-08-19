import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';


export async function GET(context) {
	const posts = await getCollection('blog');
  
	return rss({
	  title: SITE_TITLE,
	  description: SITE_DESCRIPTION,
	  site: context.site, // required so relative links resolve to absolute
	  items: posts.map((post) => ({
		// only include RSS-safe fields
		title: post.data.title,                 // string
		description: post.data.description,     // string (optional but good)
		pubDate: post.data.pubDate,             // Date (yours is z.coerce.date so OK)
		link: `/blog/${post.slug}/`,            // string; use slug here
		// If you want extra metadata, put it in `customData` as XML, e.g.:
		// customData: `<category>${post.data.tag}</category>`
	  })),
	});
  }