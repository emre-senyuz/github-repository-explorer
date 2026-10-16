export interface Repository {
  id: number;
  name: string;
  html_url: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}
export interface SearchResponse { total_count: number; incomplete_results: boolean; items: Repository[] }
export type Sort = 'best' | 'stars' | 'updated';
export interface SearchOptions { query: string; language: string; sort: Sort; page: number }
export async function searchRepositories(options: SearchOptions, signal: AbortSignal): Promise<SearchResponse> {
  const query = options.query.trim() + (options.language ? ` language:"${options.language}"` : '');
  const params = new URLSearchParams({ q: query, per_page: '10', page: String(options.page) });
  if (options.sort !== 'best') { params.set('sort', options.sort); params.set('order', 'desc'); }
  const response = await fetch(`https://api.github.com/search/repositories?${params}`, {
    signal, headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get('x-ratelimit-reset'));
    const retry = response.headers.get('retry-after');
    const guidance = retry ? ` Try again after ${retry} seconds.` : reset > 0 ? ` Try again after ${new Date(reset * 1000).toLocaleTimeString()}.` : ' Please wait a minute before trying again.';
    throw new Error(`GitHub is limiting or blocking this request (HTTP ${response.status}). Public API limits are shared by your IP address.${guidance}`);
  }
  if (!response.ok) {
    if (response.status === 422) throw new Error('GitHub could not process this search. Check your keywords and qualifiers, then try again.');
    throw new Error(`GitHub could not complete the search (HTTP ${response.status}). Please try again later.`);
  }
  return response.json() as Promise<SearchResponse>;
}
