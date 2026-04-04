export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ensureUniqueSlug(
  supabase: any,
  baseSlug: string,
  projectId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const query = supabase
      .from('projects')
      .select('id')
      .eq('slug', slug)

    if (projectId) query.neq('id', projectId)

    const { data } = await query.maybeSingle()

    if (!data) return slug

    slug = `${baseSlug}-${counter}`
    counter++
  }
}
