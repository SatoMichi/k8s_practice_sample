import { render, fireEvent, screen } from '@testing-library/svelte';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Search from '../src/lib/Search.svelte';
import * as api from '../src/lib/api';

// APIクライアントのモック
vi.mock('../src/lib/api', () => ({
  searchBooks: vi.fn()
}));

describe('Search.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('検索フォームが正しくレンダリングされ、入力と送信が機能すること', async () => {
    const mockResults = [
      { book_id: '1', title: 'Test Book', similarity: 0.8 }
    ];
    api.searchBooks.mockResolvedValue(mockResults);

    render(Search);

    // 検索フォームの要素が存在することを確認
    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    expect(searchInput).toBeInTheDocument();
    expect(searchButton).toBeInTheDocument();

    // 検索フォームに入力
    await fireEvent.input(searchInput, { target: { value: 'test query' } });
    expect(searchInput.value).toBe('test query');

    // 検索フォームを送信
    await fireEvent.click(searchButton);

    // searchBooksが正しいパラメータで呼ばれたことを確認
    expect(api.searchBooks).toHaveBeenCalledWith('test query', 5);
  });

  it('検索結果が正しく表示されること', async () => {
    const mockResults = [
      { book_id: '1', title: 'Test Book 1', similarity: 0.8 },
      { book_id: '2', title: 'Test Book 2', similarity: 0.6 }
    ];
    api.searchBooks.mockResolvedValue(mockResults);

    render(Search);

    // 検索を実行
    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });
    await fireEvent.input(searchInput, { target: { value: 'test' } });
    await fireEvent.click(searchButton);

    // 検索結果が表示されることを確認
    expect(await screen.findByText('Test Book 1')).toBeInTheDocument();
    expect(await screen.findByText('Test Book 2')).toBeInTheDocument();
  });
}); 
