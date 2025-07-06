import { render, screen } from '@testing-library/react'
import TermsAndConditions from '../../src/components/TermsAndConditions'
import userEvent from '@testing-library/user-event'

describe('TermsAndConditions', () => {
  const renderComponent = () => {
    render(<TermsAndConditions />)

    return {
      heading: screen.getByRole('heading'),
      checkBox: screen.getByRole('checkbox'),
      button: screen.getByRole('button')
    }
  }
  it('renders terms and conditions', () => {
    const {heading, checkBox, button} = renderComponent()

    expect(heading).toHaveTextContent('Terms & Conditions')
    expect(checkBox).not.toBeChecked()
    expect(button).toBeDisabled()
  })

  it('enables the button when checkbox is checked', async () => {
    const { checkBox, button } = renderComponent()

    const u = userEvent.setup()
    await u.click(checkBox)

    expect(button).toBeEnabled()
  })
})