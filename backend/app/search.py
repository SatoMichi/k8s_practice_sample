import nltk
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from scipy.sparse import csr_matrix


class SearchEngine:
    corpus: List[List[str]]
    corpus_texts: List[str]
    vectorizer: TfidfVectorizer
    tfidf_matrix: csr_matrix

    def __init__(self) -> None:
        # NLTKのデータをダウンロード
        try:
            nltk.data.find('corpora/brown')
        except LookupError:
            nltk.download('brown')

        # Brownコーパスからテキストを取得
        self.corpus = [sent for sent in nltk.corpus.brown.sents()]
        self.corpus_texts = [' '.join(sent) for sent in self.corpus]

        # TF-IDFベクトル化
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus_texts)

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        クエリに基づいてテキストを検索し、類似度スコアと共に結果を返す

        Args:
            query: 検索クエリ
            top_k: 返す結果の数

        Returns:
            検索結果のリスト（テキストとスコアを含む）
        """
        if not query.strip():
            return []

        # クエリをベクトル化
        query_vector = self.vectorizer.transform([query])

        # コサイン類似度を計算
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()

        # 上位k件のインデックスを取得
        top_indices = np.argsort(similarities)[-top_k:][::-1]

        # 結果を整形
        results: List[Dict[str, Any]] = []
        for idx in top_indices:
            if similarities[idx] > 0:  # 類似度が0より大きい場合のみ追加
                results.append({
                    'text': self.corpus_texts[idx],
                    'score': float(similarities[idx])
                })

        return results
