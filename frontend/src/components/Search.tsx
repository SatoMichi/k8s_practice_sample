import { useState } from 'react';

interface SearchResult {
  text: string;
  score: number;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('検索リクエストに失敗しました');
      }
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="検索キーワードを入力"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <p className="text-gray-800">{result.text}</p>
              <p className="text-sm text-gray-500 mt-1">
                スコア: {(result.score * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && (
          <p className="text-center text-gray-500">
            検索結果がありません
          </p>
        )
      )}
    </div>
  );
} 
