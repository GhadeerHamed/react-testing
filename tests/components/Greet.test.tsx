import { it, expect, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import Greet from '../../src/components/Greet'
import '@testing-library/jest-dom/vitest'


describe('Greet', () => {
  it('renders greet message when name is provided', () => {
    render(<Greet name='Ghadeer'/>)
  
    const h = screen.getByRole('heading');
    expect(h).toBeInTheDocument()
    expect(h).toHaveTextContent(/ghadeer/i)
  })
  
  it('renders login button when name is not provided', () => {
    render(<Greet />)
  
    const b = screen.getByRole('button');
    expect(b).toBeInTheDocument()
    expect(b).toHaveTextContent(/login/i)
  })
})