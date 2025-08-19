import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';


const authors = defineCollection({
	type: "content",
	schema: z.object({
	  name: z.string(),
	  avatar: z.string().optional(),
	  bio: z.string().optional(),
	  twitter: z.string().optional(),
	}),
  });


const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			tag: z.string(),
			author: reference('authors'),
			imageAlt: z.string(),
			featured: z.boolean()
		}),
});



const events = defineCollection({
	loader: glob({ base: './src/content/events', pattern: '**/*.md' }), // Adjust pattern for Markdown files in events directory
	schema: ({ image }) =>
	  z.object({
		title: z.string(),
		description: z.string(),
		eventDate: z.coerce.date(),
		eventTime: z.string(),
		heroImage: image().optional(),
		location: z.string()
	  }),
  });
  

export const collections = { authors, blog, events  };
