
import { render, screen } from '@testing-library/react'
import ProductList from '../../src/components/ProductList'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import { db } from '../mocks/db'

describe('ProductList', () => {
  const ids = [1,2,3]
  beforeAll(() => {
    ids.forEach(id => db.product.create({id}))
  })

  afterAll(() => {
    db.product.deleteMany({where: { id: {in: ids}}})
  })

  it('should render the list of products', async () => {
    render(<ProductList />)

    const listItems = await screen.findAllByRole('listitem')
    expect(listItems.length).toBeGreaterThan(0)
  })  

  it('should render no products available if no products found', async () => {
    server.use(http.get('/products', () =>  HttpResponse.json([])))
    render(<ProductList />)

    const message = await screen.findByText(/no products/i)
    expect(message).toBeInTheDocument()
  })

  it('should render error message when there is an error', async () => {
    server.use(http.get('/products', () =>  HttpResponse.error()))
    render(<ProductList />)

    const message = await screen.findByText(/error/i)
    expect(message).toBeInTheDocument()
  })

})