import { render, screen } from '@testing-library/react'
import TermsAndConditions from '../../src/components/TermsAndConditions'
import userEvent from '@testing-library/user-event'

describe('TermsAndConditions', () => {
  it('renders terms and conditions', () => {
    render(<TermsAndConditions />)

    const h = screen.getByRole('heading')
    expect(h).toBeInTheDocument()
    expect(h).toHaveTextContent('Terms & Conditions')

    const cb = screen.getByRole('checkbox')
    expect(cb).toBeInTheDocument()
    expect(cb).not.toBeChecked()

    const btn = screen.getByRole('button')
    expect(btn).toBeInTheDocument()
    expect(btn).toBeDisabled()
  })

  it('enables the button when checkbox is checked', async () => {
    render(<TermsAndConditions />)

    const cb = screen.getByRole('checkbox')
    const u = userEvent.setup()
    await u.click(cb)

    const btn = screen.getByRole('button')
    expect(btn).toBeEnabled()
  })
})