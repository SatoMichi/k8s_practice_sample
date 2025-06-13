import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchBooks, getBooks, getBookInfo } from '../src/lib/api';

describe('APIクライアント', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('searchBooks は正しいクエリとlimitで fetch を呼び、JSON を返す', async () => {
    const mockResponse = [{ title: 'book1', similarity: 0.9 }];
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockResponse) });
    const result = await searchBooks('love', 5);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/search?q=love&limit=5');
    expect(result).toEqual(mockResponse);
  });

  it('getBooks は /books エンドポイントを呼び、本のリストを返す', async () => {
    const mockBooks = ['book1', 'book2'];
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ books: mockBooks }) });
    const result = await getBooks();
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/books');
    expect(result).toEqual(mockBooks);
  });

  it('getBookInfo は /books/{bookId} エンドポイントを呼び、本の情報を返す', async () => {
    const mockBookInfo = { title: 'book1', content: 'content' };
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve(mockBookInfo) });
    const result = await getBookInfo('book1');
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/books/book1');
    expect(result).toEqual(mockBookInfo);
  });
}); 
