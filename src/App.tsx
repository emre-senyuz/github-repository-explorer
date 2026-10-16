import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDownUp, ArrowRight, ArrowUpRight, BookOpen, ChevronLeft, ChevronRight, Code2, Compass, Github, GitFork, Search, SlidersHorizontal, Sparkles, Star, Terminal, AlertCircle } from 'lucide-react';
import { searchRepositories, type SearchOptions, type SearchResponse, type Sort } from './api';

const examples = ['react components', 'machine learning', 'developer tools', 'awesome'];
const languages = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#', 'Ruby', 'Swift'];
const format = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const colors: Record<string, string> = { TypeScript: '#3178c6', JavaScript: '#d4b52c', Python: '#3674a5', Rust: '#b66c4c', Go: '#00a0b5', Java: '#c48435' };

export default function App() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState<Sort>('best');
  const [request, setRequest] = useState<SearchOptions | null>(null);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    searchRepositories(request, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof TypeError ? 'Unable to reach GitHub. Check your connection and try again.' : cause instanceof Error ? cause.message : 'Something went wrong. Please try again.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [request]);

  function runSearch(query: string) {
    if (!query.trim()) { searchInput.current?.focus(); return; }
    setInput(query); setData(null); setError(''); setLoading(true);
    setRequest({ query: query.trim(), language, sort, page: 1 });
  }
  function submit(event: FormEvent) { event.preventDefault(); runSearch(input); }
  function updateFilters(nextLanguage: string, nextSort: Sort) {
    setLanguage(nextLanguage); setSort(nextSort);
    if (request) { setData(null); setLoading(true); setRequest({ ...request, language: nextLanguage, sort: nextSort, page: 1 }); }
  }
  const totalPages = data ? Math.ceil(Math.min(data.total_count, 1000) / 10) : 0;
  return (
    <div className="app-shell">
      <header className="topbar"><a className="brand" href="./" aria-label="Repository Explorer home"><span className="brand-icon"><Terminal size={21}/></span><span>repo<span className="brand-light">explorer</span><span className="brand-dot">.</span></span></a><div className="header-right"><span className="public-label"><span className="status-dot"/> Built for the curious</span><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="github-link"><Github size={18}/><span>GitHub</span><ArrowUpRight size={14}/></a></div></header>
      <main>
        <section className="hero" aria-labelledby="hero-heading"><div className="eyebrow"><span className="tiny-spark"><Sparkles size={13}/></span> A WORLD OF OPEN SOURCE</div><h1 id="hero-heading">Great ideas start<br/>with <span>exploration.</span><svg className="underline" viewBox="0 0 310 12" aria-hidden="true"><path d="M3 9 Q140 -2 306 5"/></svg></h1><p className="hero-description">Find your next library, learn from great code, or discover<br className="desktop-break"/> something worth building on. It all starts with a search.</p>
          <form onSubmit={submit} className="search-form" role="search"><Search className="search-icon" size={22}/><label className="sr-only" htmlFor="query">Search public GitHub repositories</label><input ref={searchInput} id="query" value={input} onChange={event => setInput(event.target.value)} placeholder="What would you like to explore?" maxLength={256} required autoComplete="off"/><button className="search-button" type="submit">Explore <ArrowRight size={18}/></button></form>
          <div className="examples"><span>Try a search</span>{examples.map(example => <button type="button" key={example} onClick={() => runSearch(example)}>{example}<ArrowUpRight size={12}/></button>)}</div>
        </section>
        <section className="explorer" aria-label="Repository explorer"><div className="toolbar"><div className="section-title"><Compass size={20}/><h2>{request ? 'Search results' : 'Discover repositories'}</h2>{data && <span className="count">{data.total_count.toLocaleString()}</span>}</div><div className="filters"><label><Code2 size={15}/><span className="sr-only">Language</span><select value={language} onChange={event => updateFilters(event.target.value, sort)}><option value="">All languages</option>{languages.map(value => <option key={value}>{value}</option>)}</select></label><label><ArrowDownUp size={15}/><span className="sr-only">Sort results</span><select value={sort} onChange={event => updateFilters(language, event.target.value as Sort)}><option value="best">Best match</option><option value="stars">Most stars</option><option value="updated">Recently updated</option></select></label></div></div>
          <div className="results-area" aria-busy={loading}>
            <div className="sr-only" role="status" aria-live="polite">{loading ? 'Searching GitHub repositories.' : error ? 'Search failed.' : data ? `${data.total_count} repositories found. Page ${request?.page}.` : 'Enter a keyword to begin.'}</div>
            {!request && <div className="welcome"><div className="orbit"><span className="orbit-small orbit-code"><Code2 size={19}/></span><span className="orbit-small orbit-star"><Star size={18}/></span><span className="welcome-icon"><BookOpen size={35} strokeWidth={1.5}/></span><span className="orbit-point"/></div><h3>Your next discovery is one search away</h3><p>Search millions of public repositories by keyword, topic, or name.<br/>The next piece of your project might already be out there.</p><div className="search-tip"><Terminal size={14}/><span>A little inspiration: <button onClick={() => runSearch('topic:creative-coding')}>topic:creative-coding</button></span></div></div>}
            {loading && <div className="repo-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="repo-card skeleton" aria-hidden="true"><div/><div/><div/><div/></div>)}</div>}
            {!loading && error && <div className="empty-state" role="alert"><AlertCircle size={32}/><h3>We couldn’t reach those repositories</h3><p>{error}</p><button className="secondary-button" onClick={() => request && setRequest({ ...request })}>Try again</button></div>}
            {!loading && data && data.items.length === 0 && <div className="empty-state"><Search size={32}/><h3>No repositories found</h3><p>Try a broader keyword or choose a different language.</p><button className="secondary-button" onClick={() => searchInput.current?.focus()}>Edit your search</button></div>}
            {!loading && data && data.items.length > 0 && <><div className="result-context">Results for <strong>“{request?.query}”</strong>{language && ` in ${language}`}</div>{data.incomplete_results && <p className="notice">GitHub returned partial results. Try a more specific query for a complete search.</p>}<div className="repo-grid">{data.items.map(repo => <article className="repo-card" key={repo.id}><div className="repo-heading"><div className="repo-symbol"><BookOpen size={19}/></div><div className="repo-name"><span>{repo.owner.login}</span><h3><a href={repo.html_url} target="_blank" rel="noopener noreferrer">{repo.name}<ArrowUpRight size={16}/><span className="sr-only"> (opens in a new tab)</span></a></h3></div></div><p className="repo-description">{repo.description || 'No description provided.'}</p><div className="repo-stats"><span><i style={{ background: colors[repo.language || ''] || '#87918b' }}/>{repo.language || 'Not specified'}</span><span title={`${repo.stargazers_count.toLocaleString()} stars`}><Star size={14}/>{format.format(repo.stargazers_count)}<span className="sr-only"> stars</span></span><span title={`${repo.forks_count.toLocaleString()} forks`}><GitFork size={14}/>{format.format(repo.forks_count)}<span className="sr-only"> forks</span></span></div><div className="repo-bottom"><span>Updated <time dateTime={repo.updated_at}>{new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></span><a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label={`View ${repo.owner.login}/${repo.name} on GitHub (opens in a new tab)`}>View repository <ArrowUpRight size={13}/></a></div></article>)}</div><nav className="pagination" aria-label="Results pagination"><span>Page {request?.page} of {totalPages}{data.total_count > 1000 && ' · First 1,000 results'}</span><div><button disabled={request?.page === 1} onClick={() => request && setRequest({ ...request, page: request.page - 1 })}><ChevronLeft size={16}/>Previous</button><button disabled={!request || request.page >= totalPages} onClick={() => request && setRequest({ ...request, page: request.page + 1 })}>Next<ChevronRight size={16}/></button></div></nav></>}
          </div>
        </section>
        <div className="feature-strip"><span><Search size={16}/> Real repositories. Endless possibilities.</span><span><SlidersHorizontal size={15}/> Filter your way to the right fit.</span><span><Github size={16}/> Powered by the GitHub API.</span></div>
      </main><footer><span>Made for the love of open source<span className="footer-star"> ✳</span></span><span>Public data. No sign-in needed.<span className="footer-divider">/</span><a href="https://docs.github.com/en/rest/search" target="_blank" rel="noopener noreferrer">API documentation <ArrowUpRight size={12}/></a></span></footer>
    </div>
  );
}
