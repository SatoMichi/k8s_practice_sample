// APIのベースURLを環境に応じて設定
const API_BASE_URL = '/api';

/**
 * 本を検索する
 * @param {string} query - 検索クエリ
 * @returns {Promise<Array>} 検索結果の配列
 */
export async function searchBooks(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('検索リクエストに失敗しました');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('検索エラー:', error);
        throw error;
    }
}

/**
 * 利用可能な本のリストを取得する
 * @returns {Promise<Array>} 本のリスト
 */
export async function getBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) {
            throw new Error(`本のリストの取得に失敗しました: ${response.statusText}`);
        }
        const data = await response.json();
        return data.books;
    } catch (error) {
        console.error('本のリスト取得エラー:', error);
        throw error;
    }
}

/**
 * 特定の本の詳細情報を取得する
 * @param {string} bookId - 本のID
 * @returns {Promise<Object>} 本の詳細情報
 */
export async function getBookDetails(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
        if (!response.ok) {
            throw new Error('本の詳細の取得に失敗しました');
        }
        return await response.json();
    } catch (error) {
        console.error('本の詳細取得エラー:', error);
        throw error;
    }
} 
