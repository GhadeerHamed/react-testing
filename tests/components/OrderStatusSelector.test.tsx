
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
      trigger: screen.getByRole('combobox'),
      user: userEvent.setup(),
      getOptions: () => screen.findAllByRole('option'),
      onChange,
      getOption: (name: RegExp) => screen.findByRole('option', {name: name})
    }
  }

  it('renders new as the default value', () => {
    const { trigger } = renderComponent()
    expect(trigger).toHaveTextContent(/new/i)
  })

  it('renders correct statuses', async () => {
    const { trigger, user, getOptions } = renderComponent()

    await user.click(trigger)

    const options = await getOptions()
    expect( options ).toHaveLength(3)

    const labels = options.map( option => option.textContent)
    expect(labels).toEqual(['New', 'Processed', 'Fulfilled'])
  })

  it.each([
    {label: /processed/i, value: 'processed'},
    {label: /fulfilled/i, value: 'fulfilled'}
  ])('should call onChange with $value when $value option elected', async ({value, label}) => {
    const { trigger , user, onChange, getOption } = renderComponent()
    await user.click(trigger)

    const option = await getOption(label)
    await user.click(option)
    expect( onChange ).toHaveBeenCalledWith(value)
  })

  it(`should call onChange with 'new' when 'New' option elected`, async () => {
    const { trigger , user, onChange, getOption } = renderComponent()
    await user.click(trigger)

    const processedOption = await getOption(/processed/i)
    await user.click(processedOption)

    await user.click(trigger)
    const newOption = await getOption(/new/i)
    await user.click(newOption)

    expect( onChange ).toHaveBeenCalledWith('new')
  })
})