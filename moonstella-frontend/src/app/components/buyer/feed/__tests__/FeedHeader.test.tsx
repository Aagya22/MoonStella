import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedHeader from '../FeedHeader'

const baseProps = {
  selectedCuration: 'latest',
  setSelectedCuration: jest.fn(),
  setShowCreateModal: jest.fn(),
  sortMode: 'trending' as const,
  setSortMode: jest.fn(),
  selectedMaterial: null as string | null,
  setSelectedMaterial: jest.fn(),
}

const renderHeader = (overrides = {}) =>
  render(<FeedHeader {...baseProps} {...overrides} />)

describe('FeedHeader', () => {
  it('renders the three curation tabs', () => {
    renderHeader()
    expect(screen.getByText('Latest Feed')).toBeInTheDocument()
    expect(screen.getByText('Following Feed')).toBeInTheDocument()
    expect(screen.getByText('My Requests')).toBeInTheDocument()
  })

  it('selects a curation when a tab is clicked', async () => {
    const setSelectedCuration = jest.fn()
    renderHeader({ setSelectedCuration })
    await userEvent.click(screen.getByText('Following Feed'))
    expect(setSelectedCuration).toHaveBeenCalledWith('following')
  })

  it('shows the sort toggle on the latest feed', () => {
    renderHeader({ selectedCuration: 'latest' })
    expect(screen.getByText('Order By')).toBeInTheDocument()
  })

  it('hides the sort toggle on My Requests', () => {
    renderHeader({ selectedCuration: 'my-requests' })
    expect(screen.queryByText('Order By')).not.toBeInTheDocument()
  })

  it('changes sort mode when Newest is clicked', async () => {
    const setSortMode = jest.fn()
    renderHeader({ setSortMode })
    await userEvent.click(screen.getByText('Newest'))
    expect(setSortMode).toHaveBeenCalledWith('latest')
  })

  it('sets the material filter from the select', async () => {
    const setSelectedMaterial = jest.fn()
    renderHeader({ setSelectedMaterial })
    await userEvent.selectOptions(screen.getByRole('combobox'), '18k Yellow Gold')
    expect(setSelectedMaterial).toHaveBeenCalledWith('18k Yellow Gold')
  })

  it('shows a Clear button only when a material is selected', async () => {
    const setSelectedMaterial = jest.fn()
    const { rerender } = renderHeader()
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()

    rerender(<FeedHeader {...baseProps} selectedMaterial="Platinum 950" setSelectedMaterial={setSelectedMaterial} />)
    const clear = screen.getByText('Clear')
    await userEvent.click(clear)
    expect(setSelectedMaterial).toHaveBeenCalledWith(null)
  })

  it('opens the create modal from Post Request', async () => {
    const setShowCreateModal = jest.fn()
    renderHeader({ setShowCreateModal })
    await userEvent.click(screen.getByText('Post Request'))
    expect(setShowCreateModal).toHaveBeenCalledWith(true)
  })
})
