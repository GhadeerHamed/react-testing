
import { render, screen, waitFor } from '@testing-library/react'
import TagList from '../../src/components/TagList'

describe('TagList', () => {
  
  it('renders tags', async () => {
    render(<TagList />)

    // await waitFor(() => {
    //   const listItems = screen.getAllByRole('listitem')
    //   expect(listItems.length).toBeGreaterThan(0)
    // })
    
    // OR
    // findAll acts like waitFor ...
    const listItems = await screen.findAllByRole('listitem')
    expect(listItems.length).toBeGreaterThan(0)
  })

})