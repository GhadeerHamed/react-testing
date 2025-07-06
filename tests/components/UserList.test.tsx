
import { render, screen } from '@testing-library/react'
import { User } from '../../src/entities'
import UserList from '../../src/components/UserList'


describe('UserList', () => {
  it('renders no users when user array is empty', () => {
    render(<UserList users={[]} />)

    expect(screen.getByText(/no users/i)).toBeInTheDocument()
  })
  
  it('renders a list of users', () => {
    const users: User[] = [
      {id: 1, name: 'Ghadeer', isAdmin: true},
      {id:2, name: 'Ali'}
    ]
    render(<UserList users={users} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)

    users.forEach(user => {
      expect(screen.getByText(user.name)).toBeInTheDocument()

      const link = screen.getByRole('link', {name: user.name})
      expect(link).toHaveAttribute('href', `/users/${user.id}`)

    })
  })
})