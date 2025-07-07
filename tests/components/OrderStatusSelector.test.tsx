
import { render, screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import OrderStatusSelector from '../../src/components/OrderStatusSelector'
import { Theme } from '@radix-ui/themes'


describe('OrderStatusSelector', () => {
  const renderComponent = () => {
    const onChange = vi.fn()
    render(
        <Theme >
          <OrderStatusSelector onChange={onChange} />
        </Theme>
    )

    return {
      button: screen.getByRole('combobox'),
      user: userEvent.setup(),
      getOptions: () => screen.findAllByRole('option')
    }
  }

  it('renders new as the default value', () => {
    const { button } = renderComponent()
    expect(button).toHaveTextContent(/new/i)
  })

  it('renders correct statuses', async () => {
    const { button, user, getOptions } = renderComponent()

    await user.click(button)

    const options = await getOptions()
    expect( options ).toHaveLength(3)

    const labels = options.map( option => option.textContent)
    expect(labels).toEqual(['New', 'Processed', 'Fulfilled'])
  })
})