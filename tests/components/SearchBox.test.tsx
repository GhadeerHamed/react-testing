
import { render, screen } from '@testing-library/react'
import SearchBox from '../../src/components/SearchBox'
import userEvent from '@testing-library/user-event'

describe('SearchBox', () => {
  
  const renderComponent = () => {
    const onChange = vi.fn()
    render(<SearchBox onChange={onChange} />)

    return {
      input: screen.getByPlaceholderText(/search/i),
      user: userEvent.setup(),
      onChange: onChange
    }
  }

  
  it('renders theinput field for searching', () => {
    const {input} = renderComponent()
    
    expect(input).toBeInTheDocument()
  })

  it('Should call onChange when Enter pressed',async () => {
    const {input, user, onChange} = renderComponent()
    
    const searchTerm = "Search text"
    await user.type(input, searchTerm + "{enter}")
    
    expect(onChange).toHaveBeenCalledWith(searchTerm)
  })

  it('Should not call onChange when field is empty',async () => {
    const {input, user, onChange} = renderComponent()
   
    await user.type(input, "{enter}")
    
    expect(onChange).not.toHaveBeenCalled()
  })

})