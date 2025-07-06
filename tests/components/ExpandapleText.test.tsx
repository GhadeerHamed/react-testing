
import { render, screen } from '@testing-library/react'
import ExpandableText from '../../src/components/ExpandableText'
import userEvent from '@testing-library/user-event'


describe('ExpandableText', () => {
  const limit = 255
  const longText = 'a'.repeat(limit + 1)
  const trancated = longText.substring(0, limit) + '...'

  it('renders the full text if less than 255 characters', () => {
    const text = 'Short text'
    render(<ExpandableText text={text} />)
    
    expect(screen.getByText(text)).toBeInTheDocument()

  })

  it('trancates the text if more than 255 characters', () => {
    render(<ExpandableText text={longText} />)
    
    expect(screen.getByText(trancated)).toBeInTheDocument()
    
    const button = screen.queryByRole('button')
    expect(button).toHaveTextContent(/more/i)
  })
  
  it('expands text when show more button clicked', async () => {
    render(<ExpandableText text={longText} />)
    
    const showMoreButton = screen.queryByRole('button', {name: /more/i})
    const user = userEvent.setup()
    await user.click(showMoreButton!)
    expect(screen.getByText(longText)).toBeInTheDocument()
    expect(showMoreButton).toHaveTextContent(/less/i)
  })
  
  it('collabse text when show less button clicked', async () => {
    render(<ExpandableText text={longText} />)
    
    const showMoreButton = screen.queryByRole('button', {name: /more/i})
    const user = userEvent.setup()
    await user.click(showMoreButton!)
   
    const showLessButton = screen.queryByRole('button', {name: /less/i})
    await user.click(showLessButton!)
    expect(screen.getByText(trancated)).toBeInTheDocument()
    expect(showLessButton).toHaveTextContent(/more/i)
  })
})