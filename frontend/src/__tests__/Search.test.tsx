import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../components/Search';

// fetchのモック
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Search Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders search form', () => {
    render(<Search />);
    expect(screen.getByPlaceholderText(/検索キーワードを入力/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /検索/i })).toBeInTheDocument();
  });

  it('handles search input', async () => {
    render(<Search />);
    const input = screen.getByPlaceholderText(/検索キーワードを入力/i);
    await userEvent.type(input, 'test query');
    expect(input).toHaveValue('test query');
  });

  it('performs search on button click', async () => {
    const mockResults = [
      { text: 'Test result 1', score: 0.8 },
      { text: 'Test result 2', score: 0.6 },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    });

    render(<Search />);
    const input = screen.getByPlaceholderText(/検索キーワードを入力/i);
    const button = screen.getByRole('button', { name: /検索/i });

    await userEvent.type(input, 'test');
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search?q=test'),
        expect.any(Object)
      );
    });

    expect(await screen.findByText('Test result 1')).toBeInTheDocument();
    expect(await screen.findByText('Test result 2')).toBeInTheDocument();
  });

  it('handles search error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Search failed'));

    render(<Search />);
    const input = screen.getByPlaceholderText(/検索キーワードを入力/i);
    const button = screen.getByRole('button', { name: /検索/i });

    await userEvent.type(input, 'test');
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/検索中にエラーが発生しました/i)).toBeInTheDocument();
    });
  });
}); 
