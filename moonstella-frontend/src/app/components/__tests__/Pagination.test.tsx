import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from '../Pagination'

describe('Pagination', () => {
  it('renders nothing when there is a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={jest.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a button for each page in a small range', () => {
    render(<Pagination page={1} totalPages={3} onChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={5} onChange={jest.fn()} />)
    expect(screen.getByTitle('Previous Page')).toBeDisabled()
    expect(screen.getByTitle('Next Page')).not.toBeDisabled()

    rerender(<Pagination page={5} totalPages={5} onChange={jest.fn()} />)
    expect(screen.getByTitle('Next Page')).toBeDisabled()
  })

  it('calls onChange with the clicked page number', async () => {
    const onChange = jest.fn()
    render(<Pagination page={1} totalPages={3} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('advances and rewinds via Next/Previous', async () => {
    const onChange = jest.fn()
    render(<Pagination page={3} totalPages={5} onChange={onChange} />)
    await userEvent.click(screen.getByTitle('Next Page'))
    expect(onChange).toHaveBeenCalledWith(4)
    await userEvent.click(screen.getByTitle('Previous Page'))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('collapses large ranges with an ellipsis and first/last shortcuts', () => {
    render(<Pagination page={10} totalPages={20} onChange={jest.fn()} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
  })
})
