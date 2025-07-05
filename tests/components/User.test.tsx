
import { render, screen } from '@testing-library/react'
import { User } from '../../src/entities'
import UserAccount from '../../src/components/UserAccount'


describe('UserAccount', () => {
  it('renders user name', () => {
    const user: User = {id: 1, name: 'Ghadeer'}
  
    render(<UserAccount user={user} />)

    expect(screen.getByText(user.name)).toBeInTheDocument()
  })
  
  it('renders edit button if user is admin', () => {
    const user: User = {id: 1, name: 'Ghadeer', isAdmin: true}
  
    render(<UserAccount user={user} />)

    const b = screen.getByRole('button')
    expect(b).toBeInTheDocument()
    expect(b).toHaveTextContent(/edit/i)
  })
  
  it('doesnot render edit button if user is not admin', () => {
    const user: User = {id: 1, name: 'Ghadeer'}
  
    render(<UserAccount user={user} />)

    const b = screen.queryByRole('button')
    expect(b).not.toBeInTheDocument()
  })
})