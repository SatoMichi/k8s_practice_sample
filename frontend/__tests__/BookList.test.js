import { render, fireEvent, screen } from '@testing-library/svelte';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import BookList from '../src/lib/BookList.svelte';
import * as api from '../src/lib/api';

// APIクライアントのモック
vi.mock('../src/lib/api', () => ({
  getBooks: vi.fn(),
  getBookInfo: vi.fn()
}));

describe('BookList.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('書籍リストが正しくレンダリングされること', async () => {
    const mockBooks = ['book1', 'book2', 'book3'];
    api.getBooks.mockResolvedValue(mockBooks);

    render(BookList);

    // 書籍リストが表示されることを確認
    expect(await screen.findByText('book1')).toBeInTheDocument();
    expect(await screen.findByText('book2')).toBeInTheDocument();
    expect(await screen.findByText('book3')).toBeInTheDocument();

    // getBooksが呼ばれたことを確認
    expect(api.getBooks).toHaveBeenCalled();
  });

  it('書籍をクリックすると詳細情報が表示されること', async () => {
    const mockBooks = ['book1'];
    const mockBookInfo = {
      title: 'Test Book',
      author: 'Test Author',
      content: 'Test Content'
    };

    api.getBooks.mockResolvedValue(mockBooks);
    api.getBookInfo.mockResolvedValue(mockBookInfo);

    render(BookList);

    // 書籍リストが表示されるのを待つ
    const bookLink = await screen.findByText('book1');
    expect(bookLink).toBeInTheDocument();

    // 書籍をクリック
    await fireEvent.click(bookLink);

    // getBookInfoが正しいパラメータで呼ばれたことを確認
    expect(api.getBookInfo).toHaveBeenCalledWith('book1');

    // 書籍の詳細情報が表示されることを確認
    expect(await screen.findByText('Test Book')).toBeInTheDocument();
    expect(await screen.findByText('Test Author')).toBeInTheDocument();
    expect(await screen.findByText('Test Content')).toBeInTheDocument();
  });
}); 
