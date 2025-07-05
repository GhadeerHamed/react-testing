import { it, expect, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import Greet from '../../src/components/Greet'
import '@testing-library/jest-dom/vitest'


describe('Greet', () => {
  it('renders greet message', () => {
    render(<Greet name='Ghadeer'/>)
  
    const h = screen.getByRole('heading');
    expect(h).toBeInTheDocument()
  })
})