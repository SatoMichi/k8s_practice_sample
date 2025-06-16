import nltk
from nltk.corpus import gutenberg
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import csr_matrix


class GutenbergCorpus:
    books: Dict[str, Dict[str, Any]]
    vectorizer: TfidfVectorizer
    tfidf_matrix: Optional[csr_matrix]

    def __init__(self) -> None:
        # NLTKデータのダウンロード
        try:
            nltk.data.find('corpora/gutenberg')
        except LookupError:
            nltk.download('gutenberg')

        self.books = {}
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = None
        self._load_books()

    def _load_books(self) -> None:
        """Gutenbergコーパスから本を読み込み、TF-IDFベクトルを計算"""
        # 利用可能な本のリストを取得
        book_ids = gutenberg.fileids()

        # 各本のテキストを読み込み
        for book_id in book_ids:
            try:
                # 本のテキストを取得
                text = ' '.join(gutenberg.words(book_id))
                # 本の情報を保存
                self.books[book_id] = {
                    'title': book_id.replace('.txt', ''),
                    'text': text,
                    'words': len(gutenberg.words(book_id))
                }
            except Exception as e:
                print(f"Error loading {book_id}: {e}")

        # TF-IDFベクトルを計算
        texts = [book['text'] for book in self.books.values()]
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        クエリに基づいて本を検索

        Args:
            query: 検索クエリ
            top_k: 返す結果の数

        Returns:
            検索結果のリスト（本の情報と類似度スコア）
        """
        if not query.strip():
            return []

        # クエリをTF-IDFベクトルに変換
        query_vector = self.vectorizer.transform([query])

        # コサイン類似度を計算
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # 類似度の高い順にインデックスを取得
        top_indices = similarities.argsort()[-top_k:][::-1]

        # 結果を整形
        results: List[Dict[str, Any]] = []
        for idx in top_indices:
            book_id = list(self.books.keys())[idx]
            book_info = self.books[book_id]
            results.append({
                'book_id': book_id,
                'title': book_info['title'],
                'similarity_score': float(similarities[idx]),
                'word_count': book_info['words']
            })

        return results

    def get_book_info(self, book_id: str) -> Optional[Dict[str, Any]]:
        """特定の本の情報を取得"""
        if book_id in self.books:
            return self.books[book_id]
        return None
